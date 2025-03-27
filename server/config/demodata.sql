-- Initialize the demo.com tenant if it doesn't exist
DO $$
DECLARE
    v_tenant_id UUID;
BEGIN
    -- Check if demo.com tenant exists
    SELECT id INTO v_tenant_id FROM tenants WHERE domain_name = 'demo.com';
    
    -- If not, create it
    IF v_tenant_id IS NULL THEN
        INSERT INTO tenants (domain_name, plan_tier) 
        VALUES ('demo.com', 'enterprise') 
        RETURNING id INTO v_tenant_id;
        
        RAISE NOTICE 'Created demo.com tenant with ID: %', v_tenant_id;
    ELSE
        RAISE NOTICE 'Using existing demo.com tenant with ID: %', v_tenant_id;
    END IF;

    -- Add admin user for the tenant if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM users u WHERE u.tenant_id = v_tenant_id AND u.email = 'admin@demo.com') THEN
        INSERT INTO users (tenant_id, email, password_hash, role, name)
        VALUES (
            v_tenant_id, 
            'admin@demo.com',
            -- Password hash for 'password123'
            '$2b$10$3euPiPPEXu1TJW9LJqDGQO9qWWGJfbBvUxCyHvU/3vHqRRqd8Z2Aq',
            'admin',
            'Demo Admin'
        );
    END IF;
    
    -- Add regular user if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM users u WHERE u.tenant_id = v_tenant_id AND u.email = 'user@demo.com') THEN
        INSERT INTO users (tenant_id, email, password_hash, role, name)
        VALUES (
            v_tenant_id, 
            'user@demo.com',
            -- Password hash for 'password123'
            '$2b$10$3euPiPPEXu1TJW9LJqDGQO9qWWGJfbBvUxCyHvU/3vHqRRqd8Z2Aq',
            'user',
            'Demo User'
        );
    END IF;

    -- Sample Goals
    IF NOT EXISTS (SELECT 1 FROM goals g WHERE g.tenant_id = v_tenant_id LIMIT 1) THEN
        INSERT INTO goals (tenant_id, title, description, status, target_date)
        VALUES
            (v_tenant_id, 'Improve User Retention', 'Increase monthly active user retention by 15% in Q3', 'active', (CURRENT_DATE + INTERVAL '90 days')),
            (v_tenant_id, 'Enhance Mobile Experience', 'Redesign mobile app for better user experience', 'planned', (CURRENT_DATE + INTERVAL '120 days')),
            (v_tenant_id, 'Reduce Churn Rate', 'Identify and address reasons for customer churn', 'active', (CURRENT_DATE + INTERVAL '60 days')),
            (v_tenant_id, 'Expand Enterprise Features', 'Add key features requested by enterprise customers', 'planned', (CURRENT_DATE + INTERVAL '180 days')),
            (v_tenant_id, 'Improve Onboarding Flow', 'Streamline the onboarding process to increase activation', 'completed', NULL);
    END IF;

    -- Sample Customers
    IF NOT EXISTS (SELECT 1 FROM customers c WHERE c.tenant_id = v_tenant_id LIMIT 1) THEN
        INSERT INTO customers (tenant_id, name, revenue, status)
        VALUES
            (v_tenant_id, 'Acme Corporation', 50000.00, 'active'),
            (v_tenant_id, 'TechNova Systems', 35000.00, 'active'),
            (v_tenant_id, 'Global Solutions Inc', 25000.00, 'active'),
            (v_tenant_id, 'Innovative Startups', 10000.00, 'prospect'),
            (v_tenant_id, 'Digital Enterprises', 75000.00, 'active'),
            (v_tenant_id, 'NextGen Technologies', 15000.00, 'inactive');
    END IF;

    -- Get reference to a goal for initiatives
    DECLARE
        retention_goal_id UUID;
        mobile_goal_id UUID;
    BEGIN
        SELECT id INTO retention_goal_id FROM goals g WHERE g.tenant_id = v_tenant_id AND g.title = 'Improve User Retention' LIMIT 1;
        SELECT id INTO mobile_goal_id FROM goals g WHERE g.tenant_id = v_tenant_id AND g.title = 'Enhance Mobile Experience' LIMIT 1;

        -- Sample Initiatives
        IF NOT EXISTS (SELECT 1 FROM initiatives i WHERE i.tenant_id = v_tenant_id LIMIT 1) THEN
            INSERT INTO initiatives (tenant_id, goal_id, title, description, status, priority)
            VALUES
                (v_tenant_id, retention_goal_id, 'Implement Win-back Campaign', 'Create targeted campaign to re-engage inactive users', 'active', 1),
                (v_tenant_id, retention_goal_id, 'Improve Product Engagement', 'Identify features with low engagement and improve them', 'planned', 2),
                (v_tenant_id, mobile_goal_id, 'Redesign Mobile Dashboard', 'Create a more intuitive mobile dashboard', 'active', 1),
                (v_tenant_id, mobile_goal_id, 'Optimize Mobile Performance', 'Improve loading speed and responsiveness on mobile', 'planned', 3),
                (v_tenant_id, NULL, 'Launch Referral Program', 'Develop a customer referral program with incentives', 'active', 2);
        END IF;
    END;

    -- Get reference to an initiative for ideas
    DECLARE
        winback_initiative_id UUID;
        referral_initiative_id UUID;
    BEGIN
        SELECT id INTO winback_initiative_id FROM initiatives i WHERE i.tenant_id = v_tenant_id AND i.title = 'Implement Win-back Campaign' LIMIT 1;
        SELECT id INTO referral_initiative_id FROM initiatives i WHERE i.tenant_id = v_tenant_id AND i.title = 'Launch Referral Program' LIMIT 1;

        -- Sample Ideas
        IF NOT EXISTS (SELECT 1 FROM ideas i WHERE i.tenant_id = v_tenant_id LIMIT 1) THEN
            INSERT INTO ideas (tenant_id, initiative_id, title, description, priority, effort, source, status)
            VALUES
                (v_tenant_id, winback_initiative_id, 'Email Re-engagement Series', 'Create a 3-part email series to win back inactive users', 'high', 'm', 'customer interview', 'planned'),
                (v_tenant_id, winback_initiative_id, 'Special Offer for Returning Users', 'Provide a discount or bonus feature access for returning users', 'medium', 's', 'support ticket', 'new'),
                (v_tenant_id, referral_initiative_id, 'Double-sided Referral Rewards', 'Reward both referrer and referee with credits or features', 'high', 'm', 'customer survey', 'planned'),
                (v_tenant_id, NULL, 'AI-Powered Recommendations', 'Implement AI to suggest relevant content to users', 'high', 'xl', 'product team', 'new'),
                (v_tenant_id, NULL, 'Social Media Integration', 'Allow sharing of results on social media platforms', 'low', 'm', 'customer feedback', 'new');
        END IF;
    END;

    -- Sample Feedback
    IF NOT EXISTS (SELECT 1 FROM feedback f WHERE f.tenant_id = v_tenant_id LIMIT 1) THEN
        INSERT INTO feedback (tenant_id, title, description, sentiment)
        VALUES
            (v_tenant_id, 'Mobile App Crashes Frequently', 'The app crashes when I try to export data on my Android device', 'negative'),
            (v_tenant_id, 'Love the New Dashboard', 'The redesigned dashboard is much more intuitive and helpful', 'positive'),
            (v_tenant_id, 'Need Better Export Options', 'Would like to export data in more formats like PDF and CSV', 'neutral'),
            (v_tenant_id, 'Search Functionality is Amazing', 'The new search feature helps me find information quickly', 'positive'),
            (v_tenant_id, 'Missing Integration with Google Calendar', 'Would be helpful to sync with my Google Calendar', 'neutral');
    END IF;

    -- Get user ID for comments
    DECLARE
        admin_user_id UUID;
    BEGIN
        SELECT id INTO admin_user_id FROM users u WHERE u.tenant_id = v_tenant_id AND u.email = 'admin@demo.com' LIMIT 1;

        -- Link feedback to initiatives (for demo purposes)
        DECLARE
            mobile_feedback_id UUID;
            dashboard_feedback_id UUID;
            mobile_initiative_id UUID;
        BEGIN
            SELECT id INTO mobile_feedback_id FROM feedback f WHERE f.tenant_id = v_tenant_id AND f.title = 'Mobile App Crashes Frequently' LIMIT 1;
            SELECT id INTO dashboard_feedback_id FROM feedback f WHERE f.tenant_id = v_tenant_id AND f.title = 'Love the New Dashboard' LIMIT 1;
            SELECT id INTO mobile_initiative_id FROM initiatives i WHERE i.tenant_id = v_tenant_id AND i.title = 'Optimize Mobile Performance' LIMIT 1;

            -- Link feedback to initiatives
            IF NOT EXISTS (SELECT 1 FROM feedback_initiatives LIMIT 1) THEN
                INSERT INTO feedback_initiatives (feedback_id, initiative_id)
                VALUES
                    (mobile_feedback_id, mobile_initiative_id),
                    (dashboard_feedback_id, mobile_initiative_id);
            END IF;

            -- Sample Comments
            IF NOT EXISTS (SELECT 1 FROM comments LIMIT 1) AND admin_user_id IS NOT NULL THEN
                INSERT INTO comments (user_id, content, entity_type, entity_id)
                VALUES
                    (admin_user_id, 'Let''s prioritize fixing this issue this sprint', 'feedback', mobile_feedback_id),
                    (admin_user_id, 'Great to hear! The team worked hard on this', 'feedback', dashboard_feedback_id),
                    (admin_user_id, 'We should explore this for Q4 planning', 'initiative', mobile_initiative_id);
            END IF;
        END;
    END;

    -- Link customers to feedback for demo purposes
    DECLARE
        acme_customer_id UUID;
        technova_customer_id UUID;
        mobile_feedback_id UUID;
        export_feedback_id UUID;
    BEGIN
        SELECT id INTO acme_customer_id FROM customers c WHERE c.tenant_id = v_tenant_id AND c.name = 'Acme Corporation' LIMIT 1;
        SELECT id INTO technova_customer_id FROM customers c WHERE c.tenant_id = v_tenant_id AND c.name = 'TechNova Systems' LIMIT 1;
        SELECT id INTO mobile_feedback_id FROM feedback f WHERE f.tenant_id = v_tenant_id AND f.title = 'Mobile App Crashes Frequently' LIMIT 1;
        SELECT id INTO export_feedback_id FROM feedback f WHERE f.tenant_id = v_tenant_id AND f.title = 'Need Better Export Options' LIMIT 1;

        -- Link feedback to customers
        IF NOT EXISTS (SELECT 1 FROM feedback_customers LIMIT 1) THEN
            INSERT INTO feedback_customers (feedback_id, customer_id)
            VALUES
                (mobile_feedback_id, acme_customer_id),
                (export_feedback_id, technova_customer_id);
        END IF;
    END;

    -- Link customers to ideas for demo purposes
    DECLARE
        acme_customer_id UUID;
        global_customer_id UUID;
        ai_idea_id UUID;
        social_idea_id UUID;
    BEGIN
        SELECT id INTO acme_customer_id FROM customers c WHERE c.tenant_id = v_tenant_id AND c.name = 'Acme Corporation' LIMIT 1;
        SELECT id INTO global_customer_id FROM customers c WHERE c.tenant_id = v_tenant_id AND c.name = 'Global Solutions Inc' LIMIT 1;
        SELECT id INTO ai_idea_id FROM ideas i WHERE i.tenant_id = v_tenant_id AND i.title = 'AI-Powered Recommendations' LIMIT 1;
        SELECT id INTO social_idea_id FROM ideas i WHERE i.tenant_id = v_tenant_id AND i.title = 'Social Media Integration' LIMIT 1;

        -- Link ideas to customers
        IF NOT EXISTS (SELECT 1 FROM ideas_customers LIMIT 1) THEN
            INSERT INTO ideas_customers (idea_id, customer_id)
            VALUES
                (ai_idea_id, acme_customer_id),
                (social_idea_id, global_customer_id);
        END IF;
    END;

    RAISE NOTICE 'Sample data creation completed successfully for tenant ID: %', v_tenant_id;
END $$;
