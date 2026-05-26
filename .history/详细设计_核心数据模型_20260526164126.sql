-- 家享收纳 - 核心数据模型 DDL + Mock 数据
-- 数据库: PostgreSQL
-- 项目 token: proj_be03b59f7b394a62
-- 编码: UTF-8

-- ==================== 1. 表结构 ====================

CREATE TABLE sys_user (
    id VARCHAR(32) PRIMARY KEY,
    email VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(50),
    create_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE category (
    id VARCHAR(32) PRIMARY KEY,
    name VARCHAR(20) NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    color VARCHAR(20),
    icon VARCHAR(50),
    create_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE cabinet (
    id VARCHAR(32) PRIMARY KEY,
    name VARCHAR(30) NOT NULL,
    location VARCHAR(500),
    create_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE item (
    id VARCHAR(32) PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    category_id VARCHAR(32) NOT NULL,
    cabinet_id VARCHAR(32) NOT NULL,
    storage_date DATE NOT NULL,
    note VARCHAR(1000),
    create_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE item_photo (
    id VARCHAR(32) PRIMARY KEY,
    item_id VARCHAR(32) NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    create_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE cabinet_photo (
    id VARCHAR(32) PRIMARY KEY,
    cabinet_id VARCHAR(32) NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    create_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX uk_category_name ON category (LOWER(name)) WHERE deleted = FALSE;
CREATE UNIQUE INDEX uk_cabinet_name ON cabinet (LOWER(name)) WHERE deleted = FALSE;
CREATE INDEX idx_item_category_id ON item (category_id);
CREATE INDEX idx_item_cabinet_id ON item (cabinet_id);
CREATE INDEX idx_item_storage_date ON item (storage_date);
CREATE INDEX idx_item_create_time ON item (create_time);
CREATE INDEX idx_cabinet_create_time ON cabinet (create_time);
CREATE INDEX idx_item_photo_item_id ON item_photo (item_id);
CREATE INDEX idx_cabinet_photo_cabinet_id ON cabinet_photo (cabinet_id);

COMMENT ON TABLE sys_user IS '系统用户（本期单用户演示）';
COMMENT ON COLUMN sys_user.email IS '登录邮箱';
COMMENT ON COLUMN sys_user.password_hash IS '密码哈希';

COMMENT ON TABLE category IS '物品分类';
COMMENT ON COLUMN category.sort_order IS '排序序号，越小越靠前';

COMMENT ON TABLE cabinet IS '储物柜';
COMMENT ON COLUMN cabinet.location IS '位置描述';

COMMENT ON TABLE item IS '物品';
COMMENT ON COLUMN item.storage_date IS '存放日期';
COMMENT ON COLUMN item.category_id IS '逻辑外键-分类ID';
COMMENT ON COLUMN item.cabinet_id IS '逻辑外键-储物柜ID';

COMMENT ON TABLE item_photo IS '物品照片';
COMMENT ON TABLE cabinet_photo IS '储物柜照片';

-- ==================== 2. Mock 数据 ====================

INSERT INTO sys_user (id, email, password_hash, display_name, create_time, update_time, deleted)
VALUES
('usr-demo-001', 'admin@example.com', '$2a$10$demo_hash_placeholder', '家庭管理员', '2025-01-01 08:00:00', '2025-01-01 08:00:00', FALSE);

INSERT INTO category (id, name, sort_order, color, icon, create_time, update_time, deleted)
VALUES
('cat-1', '生活用品', 1, 'amber', 'Sparkles', '2025-01-01 08:00:00', '2025-01-01 08:00:00', FALSE),
('cat-2', '衣物', 2, 'rose', 'Shirt', '2025-01-01 08:00:00', '2025-01-01 08:00:00', FALSE),
('cat-3', '工具', 3, 'emerald', 'Wrench', '2025-01-01 08:00:00', '2025-01-01 08:00:00', FALSE),
('cat-4', '药品', 4, 'sky', 'Pill', '2025-01-01 08:00:00', '2025-01-01 08:00:00', FALSE),
('cat-5', '文件', 5, 'violet', 'FileText', '2025-01-01 08:00:00', '2025-01-01 08:00:00', FALSE);

INSERT INTO cabinet (id, name, location, create_time, update_time, deleted)
VALUES
('cab-1', '主卧衣柜', '主卧进门右侧，三层分区', '2025-01-01 08:00:00', '2025-01-01 08:00:00', FALSE),
('cab-2', '阳台工具箱', '阳台右侧置物架第二层', '2025-01-05 10:00:00', '2025-01-05 10:00:00', FALSE),
('cab-3', '厨房储物柜', '厨房吊柜左侧', '2025-02-10 14:00:00', '2025-02-10 14:00:00', FALSE),
('cab-4', '书房文件柜', '书房书桌下方抽屉柜', '2025-01-20 09:00:00', '2025-01-20 09:00:00', FALSE),
('cab-5', '客厅杂物柜', '客厅电视柜旁立柜', '2025-03-01 11:00:00', '2025-03-01 11:00:00', FALSE);

INSERT INTO item (id, name, category_id, cabinet_id, storage_date, note, create_time, update_time, deleted)
VALUES
('item-1', '冬季羽绒服', 'cat-2', 'cab-1', '2025-11-01', '加厚长款，黑色', '2025-11-01 10:00:00', '2025-11-01 10:00:00', FALSE),
('item-2', '螺丝刀套装', 'cat-3', 'cab-2', '2025-03-15', '6件套精密螺丝刀', '2025-03-15 14:30:00', '2025-03-15 14:30:00', FALSE),
('item-3', '常用药品箱', 'cat-4', 'cab-3', '2025-05-20', '感冒灵、退烧药', '2025-05-20 09:00:00', '2025-05-20 09:00:00', FALSE),
('item-4', '重要文件袋', 'cat-5', 'cab-4', '2025-01-10', '房产证、户口本', '2025-01-10 16:00:00', '2025-01-10 16:00:00', FALSE),
('item-5', '保温杯', 'cat-1', 'cab-5', '2025-07-10', '500ml不锈钢', '2025-07-10 13:00:00', '2025-07-10 13:00:00', FALSE);

INSERT INTO item_photo (id, item_id, file_url, sort_order, create_time)
VALUES
('iph-1', 'item-1', '/minio/items/item-1-1.jpg', 0, '2025-11-01 10:00:00'),
('iph-2', 'item-2', '/minio/items/item-2-1.jpg', 0, '2025-03-15 14:30:00');

INSERT INTO cabinet_photo (id, cabinet_id, file_url, sort_order, create_time)
VALUES
('cph-1', 'cab-1', '/minio/cabinets/cab-1-1.jpg', 0, '2025-01-01 08:00:00');
