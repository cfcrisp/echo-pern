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
      
      console.log(`📝 CREATE HANDLER - Request to create ${entity}`);
      console.log(`🔑 CREATE HANDLER - Authenticated user:`, user ? `ID: ${user.id}, Tenant: ${user.tenant_id}` : 'No user');
      console.log(`📨 CREATE HANDLER - Request headers:`, {
        'content-type': req.headers['content-type'],
        'authorization': req.headers.authorization ? 'Present' : 'Missing',
        'x-tenant-id': req.headers['x-tenant-id'] || 'Missing'
      });
      
      let processedData = { ...body };
      
      // If preprocessor is provided, use it to process the data
      if (options.preprocessor) {
        console.log(`🔄 CREATE HANDLER - Calling custom preprocessor for ${entity}`);
        processedData = await options.preprocessor(processedData, req);
      }
      
      // For idea entities, streamlined customer_ids handling 
      if (entity === 'ideas' && processedData.customer_ids) {
        // Store for post-processing if not already handled by preprocessor
        if (!req.customerIds) {
          req.customerIds = processedData.customer_ids;
        }
        delete processedData.customer_ids;
      }
      
      // Add tenant_id from the authenticated user
      if (user && user.tenant_id) {
        processedData.tenant_id = user.tenant_id;
        console.log(`👤 CREATE HANDLER - Set tenant_id from user: ${processedData.tenant_id}`);
      } else {
        console.log(`⚠️ CREATE HANDLER - No authenticated user or tenant_id available`);
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
      
      console.log(`✅ CREATE HANDLER - Final data to create:`, JSON.stringify(processedData));
      
      // Validate and create the entity
      console.log(`💾 CREATE HANDLER - Attempting to create ${entity} in database`);
      const result = await model.create(processedData);
      
      if (result) {
        console.log(`✅ CREATE HANDLER - Successfully created ${entity} with ID: ${result.id}`);
      } else {
        console.log(`⚠️ CREATE HANDLER - Created ${entity} but no result returned`);
      }
      
      // If postprocessor is provided, use it to process the result
      if (options.postprocessor) {
        console.log(`🔄 CREATE HANDLER - Calling postprocessor for ${entity}`);
        await options.postprocessor(result, req);
      }
      
      // Return the created entity
      return res.status(201).json(result);
    } catch (error) {
      console.error(`❌ CREATE HANDLER - Error creating ${entity}:`, error);
      console.error(`❌ CREATE HANDLER - Error stack:`, error.stack);
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
      // Get tenant ID, either from authenticated user or request
      let tenantId = null;
      if (req.user && req.user.tenant_id) {
        tenantId = req.user.tenant_id;
      } else {
        // Try to extract tenant ID from request
        try {
          const { extractTenantId } = require('../middleware/tenant');
          tenantId = extractTenantId(req);
        } catch (err) {
          console.error('Error extracting tenant ID:', err);
        }
      }
      
      // Also check for tenant ID directly on request (may be set by middleware)
      if (!tenantId && req.tenantId) {
        tenantId = req.tenantId;
      }
      
      if (!tenantId) {
        return res.json([]);
      }
      
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
          entities = await model.findByTenantWithOptions(tenantId, queryOptions);
        } else {
          // Fallback to basic method with just status filter
          entities = await model.findByTenant(tenantId, filters.status || null);
        }
      } else if (typeof model[listMethod] === 'function') {
        // Call custom method
        entities = await model[listMethod](tenantId, queryOptions);
      } else {
        throw new Error(`Method ${listMethod} not found on model ${model.tableName}`);
      }
      
      // Apply any post-processing
      if (postProcess) {
        entities = await postProcess(entities, req);
      }
      
      // Return the entities
      return res.json(entities);
    } catch (error) {
      console.error(`Error listing ${model.tableName}:`, error);
      return res.status(500).json({ error: `Server error: ${error.message}` });
    }
  };
};

/**
 * Factory function to create a standardized entity get-by-id handler
 * @param {Object} model - The model instance to use
 * @param {Function} postProcess - Optional function to post-process the entity
 * @returns {Function} Express request handler
 */
const getEntityByIdHandler = (model, postProcess = null) => {
  return async (req, res) => {
    try {
      const { id } = req.params;
      
      // Get entity by ID
      const entity = await model.findById(id);
      
      // Check if entity exists
      if (!entity) {
        return res.status(404).json({ error: `${model.tableName} not found` });
      }
      
      // Apply any post-processing
      let processedEntity = entity;
      if (postProcess) {
        processedEntity = await postProcess(entity);
      }
      
      // Return the entity
      return res.json(processedEntity);
    } catch (error) {
      console.error(`Error getting ${model.tableName} by ID:`, error);
      return res.status(500).json({ error: `Server error: ${error.message}` });
    }
  };
};

module.exports = { 
  createEntityHandler,
  listEntityHandler,
  getEntityByIdHandler
}; 