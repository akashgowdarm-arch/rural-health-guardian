-- LaunchFlow PostgreSQL Production Database Schema
-- Defines all relational models, indices, constraints, and audit tables

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    agent_token VARCHAR(255) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS repositories (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    default_branch VARCHAR(100) DEFAULT 'main',
    selected_branch VARCHAR(100) DEFAULT 'main',
    clone_url TEXT,
    source_type VARCHAR(50) DEFAULT 'github', -- 'github', 'zip', 'cli'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS projects (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    repository_id VARCHAR(64) REFERENCES repositories(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    framework VARCHAR(100) NOT NULL, -- 'nextjs', 'react-vite', 'nodejs-express', 'static-html'
    language VARCHAR(50) DEFAULT 'typescript',
    package_manager VARCHAR(50) DEFAULT 'npm',
    build_command TEXT NOT NULL,
    start_command TEXT NOT NULL,
    port INTEGER DEFAULT 3000,
    subdomain VARCHAR(255) UNIQUE NOT NULL,
    custom_domain VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending',
    current_deployment_id VARCHAR(64),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS deployments (
    id VARCHAR(64) PRIMARY KEY,
    project_id VARCHAR(64) REFERENCES projects(id) ON DELETE CASCADE,
    version INTEGER NOT NULL,
    status VARCHAR(50) NOT NULL,
    preview_url TEXT,
    production_url TEXT,
    readiness_score INTEGER,
    commit_hash VARCHAR(64),
    commit_message TEXT,
    branch VARCHAR(100) DEFAULT 'main',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    live_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS builds (
    id VARCHAR(64) PRIMARY KEY,
    project_id VARCHAR(64) REFERENCES projects(id) ON DELETE CASCADE,
    deployment_id VARCHAR(64) REFERENCES deployments(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    exit_code INTEGER,
    duration_ms INTEGER,
    error_summary TEXT,
    error_explanation JSONB
);

CREATE TABLE IF NOT EXISTS build_logs (
    id VARCHAR(64) PRIMARY KEY,
    build_id VARCHAR(64) REFERENCES builds(id) ON DELETE CASCADE,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    level VARCHAR(20) NOT NULL,
    message TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS environment_variables (
    id VARCHAR(64) PRIMARY KEY,
    project_id VARCHAR(64) REFERENCES projects(id) ON DELETE CASCADE,
    key VARCHAR(255) NOT NULL,
    value TEXT NOT NULL, -- Encrypted ciphertext
    is_secret BOOLEAN DEFAULT FALSE,
    category VARCHAR(50) DEFAULT 'optional', -- 'required', 'optional', 'public', 'secret'
    detected_location TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(project_id, key)
);

CREATE TABLE IF NOT EXISTS preview_environments (
    id VARCHAR(64) PRIMARY KEY,
    project_id VARCHAR(64) REFERENCES projects(id) ON DELETE CASCADE,
    deployment_id VARCHAR(64) REFERENCES deployments(id) ON DELETE CASCADE,
    internal_port INTEGER NOT NULL,
    preview_url TEXT NOT NULL,
    pid INTEGER,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS readiness_reports (
    id VARCHAR(64) PRIMARY KEY,
    project_id VARCHAR(64) REFERENCES projects(id) ON DELETE CASCADE,
    deployment_id VARCHAR(64) REFERENCES deployments(id) ON DELETE CASCADE,
    total_score INTEGER NOT NULL,
    passed BOOLEAN NOT NULL,
    checks JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS readiness_issues (
    id VARCHAR(64) PRIMARY KEY,
    report_id VARCHAR(64) REFERENCES readiness_reports(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL, -- 'critical', 'warning', 'info'
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    detected_value TEXT,
    recommended_fix TEXT NOT NULL,
    fix_action JSONB
);

CREATE TABLE IF NOT EXISTS tunnel_sessions (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    local_port INTEGER NOT NULL,
    status VARCHAR(50) NOT NULL,
    agent_token VARCHAR(255) NOT NULL,
    connected_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_ping_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS health_checks (
    id VARCHAR(64) PRIMARY KEY,
    project_id VARCHAR(64) REFERENCES projects(id) ON DELETE CASCADE,
    deployment_id VARCHAR(64) REFERENCES deployments(id) ON DELETE CASCADE,
    target_url TEXT NOT NULL,
    interval_seconds INTEGER DEFAULT 60,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS health_check_results (
    id VARCHAR(64) PRIMARY KEY,
    health_check_id VARCHAR(64) REFERENCES health_checks(id) ON DELETE CASCADE,
    status_code INTEGER,
    response_time_ms INTEGER,
    is_healthy BOOLEAN NOT NULL,
    checked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    error_message TEXT
);

CREATE TABLE IF NOT EXISTS domains (
    id VARCHAR(64) PRIMARY KEY,
    project_id VARCHAR(64) REFERENCES projects(id) ON DELETE CASCADE,
    domain VARCHAR(255) UNIQUE NOT NULL,
    is_custom BOOLEAN DEFAULT FALSE,
    verified BOOLEAN DEFAULT FALSE,
    ssl_status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indices for performance and cross-user isolation
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_deployments_project_id ON deployments(project_id);
CREATE INDEX IF NOT EXISTS idx_builds_project_id ON builds(project_id);
CREATE INDEX IF NOT EXISTS idx_build_logs_build_id ON build_logs(build_id);
CREATE INDEX IF NOT EXISTS idx_env_vars_project_id ON environment_variables(project_id);
CREATE INDEX IF NOT EXISTS idx_readiness_reports_project_id ON readiness_reports(project_id);
CREATE INDEX IF NOT EXISTS idx_health_results_check_id ON health_check_results(health_check_id);
