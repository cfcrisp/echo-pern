/**
 * Shared request handlers for common operations
 */

/**
 * Generic handler for creating entities
 * @param {Object} model - Database model
 * @param {Array} requiredFields - Fields required in request body
 * @param {Function} preProcess - Optional function to pre-process request data
 * @returns {Function} Express middleware function
 */
const createEntityHandler = (model, entity, options = {}) => {
  return async (req, res) => {
    try {
      const { body, user } = req;
      
      let processedData = { ...body };
      
      // If preprocessor is provided, use it to process the data
      if (options.preprocessor) {
        processedData = await options.preprocessor(processedData, req);
      }
      
      // Handle special fields for certain entity types
      if (entity === 'feedback') {
        // Handle content field - map to title if title is missing, then remove content
        if (processedData.content && !processedData.title) {
          processedData.title = processedData.content;
        }
        delete processedData.content;
        
        // Store customer/initiative IDs in request object for post-processing
        // Then remove them from processedData to avoid DB errors
        ['customer_id', 'customer_ids', 'initiative_id', 'initiative_ids'].forEach(field => {
          if (processedData[field]) {
            req[field === 'customer_id' ? 'customerId' : 
                field === 'customer_ids' ? 'customerIds' : 
                field === 'initiative_id' ? 'initiativeId' : 'initiativeIds'] = processedData[field];
            delete processedData[field];
          }
        });
      }
      // For idea entities, streamlined customer_ids handling 
      else if (entity === 'ideas' && processedData.customer_ids) {
        // Store for post-processing if not already handled by preprocessor
        if (!req.customerIds) {
          req.customerIds = processedData.customer_ids;
        }
        delete processedData.customer_ids;
      }
      
      // Add tenant_id from the authenticated user
      if (user && user.tenant_id) {
        processedData.tenant_id = user.tenant_id;
      }
      
      // Only add user_id for specific tables that have this column
      // The 'ideas' table does not have a user_id column per the database schema
      if (['users', 'customers'].includes(entity) && user && user.id) {
        processedData.user_id = user.id;
      }
      
      // Apply default status for ideas if not set
      if (entity === 'ideas' && !processedData.status) {
        processedData.status = 'new';
      }
      
      // Validate and create the entity
      const result = await model.create(processedData);
      
      // If postprocessor is provided, use it to process the result
      if (options.postprocessor) {
        await options.postprocessor(result, req);
      }
      
      // Return the created entity
      return res.status(201).json(result);
    } catch (error) {
      console.error(`Error creating ${entity}:`, error);
      return res.status(500).json({ error: `Server error: ${error.message}` });
    }
  };
};

/**
 * Factory function to create a standardized entity list handler
 * @param {Object} model - The model instance to use for listing
 * @param {Function} listMethod - Method to call to get the list, defaults to findByTenant
 * @param {Object} options - Additional options for customizing behavior
 * @returns {Function} Express request handler
 */
const listEntityHandler = (model, listMethod = 'findByTenant', options = {}) => {
  const {
    allowedFilters = ['status'], // Fields that can be filtered through query params
    sortParam = 'sort',          // Query param name for sorting
    defaultSort = 'created_at',  // Default sort field
    defaultOrder = 'desc',       // Default sort order
    postProcess = null,          // Function for post-processing
  } = options;
  
  return async (req, res) => {
    try {
      console.log(`listEntityHandler called for model: ${model.tableName}, method: ${listMethod}`);
      
      // Get tenant ID, either from authenticated user or request
      let tenantId = null;
      if (req.user && req.user.tenant_id) {
        tenantId = req.user.tenant_id;
        console.log(`Tenant ID from user: ${tenantId}`);
      } else {
        // Try to extract tenant ID from request
        try {
          const { extractTenantId } = require('../middleware/tenant');
          tenantId = extractTenantId(req);
          console.log(`Tenant ID extracted from request: ${tenantId}`);
        } catch (err) {
          console.error('Error extracting tenant ID:', err);
        }
      }
      
      // Also check for tenant ID directly on request (may be set by middleware)
      if (!tenantId && req.tenantId) {
        tenantId = req.tenantId;
        console.log(`Using tenantId from request object: ${tenantId}`);
      }
      
      if (!tenantId) {
        console.log('No tenant ID found, returning empty array');
        return res.json([]);
      }
      
      console.log(`Fetching ${model.tableName} for tenant: ${tenantId}`);
      
      // Parse query parameters for filtering
      const filters = {};
      
      // Apply allowed filters from query params
      for (const filter of allowedFilters) {
        if (req.query[filter]) {
          filters[filter] = req.query[filter];
        }
      }
      
      // Parse sorting parameters
      let sort = defaultSort;
      let order = defaultOrder;
      
      if (req.query[sortParam]) {
        // Expect format like 'created_at:desc' or 'title:asc'
        const sortParts = req.query[sortParam].split(':');
        if (sortParts.length >= 1) {
          sort = sortParts[0];
        }
        if (sortParts.length >= 2) {
          order = sortParts[1].toLowerCase() === 'asc' ? 'asc' : 'desc';
        }
      }
      
      // Get pagination parameters
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 50;
      const offset = (page - 1) * limit;
      
      console.log('Query parameters processed:');
      console.log('- Filters:', filters);
      console.log('- Sort:', sort);
      console.log('- Order:', order);
      console.log('- Limit:', limit);
      console.log('- Offset:', offset);
      
      // Call the appropriate list method
      let entities;
      const queryOptions = { 
        sort, 
        order, 
        limit, 
        offset,
        filters 
      };
      
      if (listMethod === 'findByTenant') {
        // Handle the default case
        if (model.findByTenantWithOptions && typeof model.findByTenantWithOptions === 'function') {
          // If the model supports advanced options
          console.log('Using findByTenantWithOptions method');
          entities = await model.findByTenantWithOptions(tenantId, queryOptions);
        } else {
          // Fallback to basic method with just status filter
          console.log('Using basic findByTenant method');
          entities = await model.findByTenant(tenantId, filters.status || null);
        }
      } else if (typeof model[listMethod] === 'function') {
        // Call custom method
        console.log(`Using custom method: ${listMethod}`);
        entities = await model[listMethod](tenantId, queryOptions);
      } else {
        throw new Error(`Method ${listMethod} not found on model ${model.tableName}`);
      }
      
      console.log(`Retrieved ${entities ? entities.length : 0} ${model.tableName}`);
      
      // Apply any post-processing
      if (postProcess) {
        console.log('Applying post-processing');
        entities = await postProcess(entities, req);
      }
      
      res.json(entities || []);
    } catch (error) {
      console.error(`Error in listEntityHandler for ${model.tableName}:`, error);
      console.error('Stack trace:', error.stack);
      res.status(500).json({ 
        error: `Server error listing ${model.tableName}`, 
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  };
};

/**
 * Factory function to create a standardized get entity by ID handler
 * @param {Object} model - The model instance to use
 * @param {Function} postProcess - Optional function to process data after fetching
 * @returns {Function} Express request handler
 */
const getEntityByIdHandler = (model, postProcess = null) => {
  return async (req, res) => {
    try {
      const id = req.params.id;
      
      if (!id) {
        return res.status(400).json({ error: 'ID parameter is required' });
      }
      
      console.log(`GET /${model.tableName}/${id} request received`);
      
      // Get the entity
      const entity = await model.findById(id);
      
      if (!entity) {
        return res.status(404).json({ error: `${model.tableName.slice(0, -1)} not found` });
      }
      
      // Apply any post-processing if provided
      if (postProcess) {
        const processedEntity = await postProcess(entity, req);
        return res.json(processedEntity);
      }
      
      res.json(entity);
    } catch (error) {
      console.error(`Error getting ${model.tableName} by ID:`, error.message);
      res.status(500).json({ 
        error: `Server error getting ${model.tableName} by ID`, 
        details: error.message 
      });
    }
  };
};

module.exports = { 
  createEntityHandler,
  listEntityHandler,
  getEntityByIdHandler
}; 