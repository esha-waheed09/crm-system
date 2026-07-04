-- ============================================================
-- CRM Database - Customer Relationship Management System
-- Student: Eshaal Waheed | Section B | UET Peshawar
-- ============================================================

DROP DATABASE IF EXISTS crm_db;
CREATE DATABASE crm_db;
USE crm_db;

-- ─────────────────────────────────────────
-- TABLE 1: PERSON (Supertype)
-- ─────────────────────────────────────────
CREATE TABLE PERSON (
    Person_ID     INT PRIMARY KEY AUTO_INCREMENT,
    Person_Name   VARCHAR(100) NOT NULL,
    Email         VARCHAR(150) UNIQUE,
    Phone         VARCHAR(20),
    Address       VARCHAR(255),
    Person_Type   ENUM('LEAD','CUSTOMER','SALES_REP') NOT NULL
);

-- ─────────────────────────────────────────
-- TABLE 2: CAMPAIGN
-- ─────────────────────────────────────────
CREATE TABLE CAMPAIGN (
    Campaign_ID    INT PRIMARY KEY AUTO_INCREMENT,
    Campaign_Name  VARCHAR(150) NOT NULL,
    Campaign_Type  VARCHAR(50),
    Start_Date     DATE,
    End_Date       DATE,
    Budget         DECIMAL(12,2)
);

-- ─────────────────────────────────────────
-- TABLE 3: PIPELINE_STAGE
-- ─────────────────────────────────────────
CREATE TABLE PIPELINE_STAGE (
    Stage_ID     INT PRIMARY KEY AUTO_INCREMENT,
    Stage_Name   VARCHAR(100) NOT NULL,
    Stage_Order  INT,
    Description  VARCHAR(255)
);

-- ─────────────────────────────────────────
-- TABLE 4: SALES_REP (Subtype)
-- ─────────────────────────────────────────
CREATE TABLE SALES_REP (
    Person_ID        INT PRIMARY KEY,
    Employee_ID      VARCHAR(20) UNIQUE,
    Department       VARCHAR(100),
    Hire_Date        DATE,
    Commission_Rate  DECIMAL(5,2),
    FOREIGN KEY (Person_ID) REFERENCES PERSON(Person_ID)
);

-- ─────────────────────────────────────────
-- TABLE 5: LEAD (Subtype)
-- ─────────────────────────────────────────
CREATE TABLE LEADS (
    Person_ID      INT PRIMARY KEY,
    Campaign_ID    INT NOT NULL,
    Rep_ID         INT,
    Stage_ID       INT NOT NULL,
    Lead_Source    VARCHAR(100),
    Date_Captured  DATE NOT NULL,
    Status         VARCHAR(50),
    FOREIGN KEY (Person_ID)   REFERENCES PERSON(Person_ID),
    FOREIGN KEY (Campaign_ID) REFERENCES CAMPAIGN(Campaign_ID),
    FOREIGN KEY (Rep_ID)      REFERENCES SALES_REP(Person_ID),
    FOREIGN KEY (Stage_ID)    REFERENCES PIPELINE_STAGE(Stage_ID)
);

-- ─────────────────────────────────────────
-- TABLE 6: CUSTOMER (Subtype)
-- ─────────────────────────────────────────
CREATE TABLE CUSTOMER (
    Person_ID            INT PRIMARY KEY,
    Conversion_Date      DATE,
    Total_Purchase_Value DECIMAL(10,2),
    FOREIGN KEY (Person_ID) REFERENCES PERSON(Person_ID)
);

-- ─────────────────────────────────────────
-- TABLE 7: CONTACT
-- ─────────────────────────────────────────
CREATE TABLE CONTACT (
    Contact_ID     INT PRIMARY KEY AUTO_INCREMENT,
    Lead_ID        INT NOT NULL,
    Rep_ID         INT NOT NULL,
    Contact_Date   DATETIME NOT NULL,
    Contact_Type   VARCHAR(50),
    Notes          TEXT,
    Next_Follow_Up DATE,
    FOREIGN KEY (Lead_ID) REFERENCES LEADS(Person_ID),
    FOREIGN KEY (Rep_ID)  REFERENCES SALES_REP(Person_ID)
);

-- ─────────────────────────────────────────
-- TABLE 8: FEEDBACK
-- ─────────────────────────────────────────
CREATE TABLE FEEDBACK (
    Feedback_ID   INT PRIMARY KEY AUTO_INCREMENT,
    Customer_ID   INT NOT NULL,
    Feedback_Date DATE NOT NULL,
    Rating        INT CHECK (Rating BETWEEN 1 AND 5),
    Category      VARCHAR(100),
    Comments      TEXT,
    FOREIGN KEY (Customer_ID) REFERENCES CUSTOMER(Person_ID)
);

-- ─────────────────────────────────────────
-- TABLE 9: COMPLAINT
-- ─────────────────────────────────────────
CREATE TABLE COMPLAINT (
    Complaint_ID   INT PRIMARY KEY AUTO_INCREMENT,
    Customer_ID    INT NOT NULL,
    Complaint_Date DATE NOT NULL,
    Subject        VARCHAR(200) NOT NULL,
    Description    TEXT,
    Status         VARCHAR(50),
    FOREIGN KEY (Customer_ID) REFERENCES CUSTOMER(Person_ID)
);

-- ─────────────────────────────────────────
-- TABLE 10: RESOLUTION
-- ─────────────────────────────────────────
CREATE TABLE RESOLUTION (
    Resolution_ID   INT PRIMARY KEY AUTO_INCREMENT,
    Complaint_ID    INT NOT NULL,
    Rep_ID          INT,
    Resolution_Date DATE NOT NULL,
    Action_Taken    TEXT NOT NULL,
    Outcome         VARCHAR(100),
    FOREIGN KEY (Complaint_ID) REFERENCES COMPLAINT(Complaint_ID),
    FOREIGN KEY (Rep_ID)       REFERENCES SALES_REP(Person_ID)
);

-- ─────────────────────────────────────────
-- TABLE 11: CONVERSION_EVENT
-- ─────────────────────────────────────────
CREATE TABLE CONVERSION_EVENT (
    Lead_ID         INT NOT NULL,
    Customer_ID     INT NOT NULL,
    Conversion_Date DATE NOT NULL,
    Rep_ID          INT,
    Notes           TEXT,
    PRIMARY KEY (Lead_ID, Customer_ID),
    FOREIGN KEY (Lead_ID)     REFERENCES LEADS(Person_ID),
    FOREIGN KEY (Customer_ID) REFERENCES CUSTOMER(Person_ID),
    FOREIGN KEY (Rep_ID)      REFERENCES SALES_REP(Person_ID)
);

-- ============================================================
-- SAMPLE DATA
-- ============================================================

-- PERSON
INSERT INTO PERSON VALUES
(1,'Ayesha Khan','ayesha@email.com','0312-1111111','House 5, Peshawar','SALES_REP'),
(2,'Bilal Ahmed','bilal@email.com','0333-2222222','House 12, Islamabad','SALES_REP'),
(3,'Sara Malik','sara@gmail.com','0300-3333333','Block A, Lahore','LEAD'),
(4,'Usman Ali','usman@gmail.com','0321-4444444','Street 7, Karachi','LEAD'),
(5,'Hina Javed','hina@gmail.com','0345-5555555','F-8, Islamabad','LEAD'),
(6,'Kamran Shah','kamran@gmail.com','0311-6666666','Hayatabad, Peshawar','LEAD'),
(7,'Nadia Qureshi','nadia@gmail.com','0322-7777777','DHA, Lahore','CUSTOMER'),
(8,'Tariq Mehmood','tariq@gmail.com','0333-8888888','G-10, Islamabad','CUSTOMER'),
(9,'Zara Hussain','zara@gmail.com','0300-9999999','Model Town, Lahore','CUSTOMER'),
(10,'Faisal Raza','faisal@gmail.com','0312-1010101','Saddar, Peshawar','LEAD');

-- CAMPAIGN
INSERT INTO CAMPAIGN VALUES
(1,'Summer Email Drive','Email','2024-06-01','2024-06-30',50000.00),
(2,'Social Media Blast','Social Media','2024-07-01','2024-07-31',75000.00),
(3,'Referral Program','Referral','2024-08-01','2024-09-30',30000.00),
(4,'Google Ads Q3','Paid Ads','2024-07-15','2024-09-15',120000.00);

-- PIPELINE_STAGE
INSERT INTO PIPELINE_STAGE VALUES
(1,'Prospect',1,'Initial contact made'),
(2,'Qualified',2,'Lead meets criteria'),
(3,'Proposal',3,'Proposal sent to lead'),
(4,'Negotiation',4,'Terms being discussed'),
(5,'Closed Won',5,'Deal successfully closed'),
(6,'Closed Lost',6,'Lead did not convert');

-- SALES_REP
INSERT INTO SALES_REP VALUES
(1,'EMP001','Sales','2022-03-15',5.00),
(2,'EMP002','Sales','2023-01-10',4.50);

-- LEAD
INSERT INTO LEADS VALUES
(3,1,1,2,'Email','2024-06-10','In-Progress'),
(4,2,1,3,'Social Media','2024-07-05','In-Progress'),
(5,2,2,1,'Referral','2024-08-15','New'),
(6,4,2,4,'Google Ads','2024-08-20','In-Progress'),
(10,3,1,2,'Referral','2024-09-01','New');

-- CUSTOMER
INSERT INTO CUSTOMER VALUES
(7,'2024-06-25',85000.00),
(8,'2024-07-18',120000.00),
(9,'2024-08-10',55000.00);

-- CONTACT
INSERT INTO CONTACT VALUES
(1,3,1,'2024-06-12 10:00:00','Call','Discussed product features','2024-06-19'),
(2,3,1,'2024-06-19 11:30:00','Email','Sent product brochure','2024-06-26'),
(3,4,1,'2024-07-06 09:00:00','Meeting','Demo given','2024-07-13'),
(4,6,2,'2024-08-22 14:00:00','Call','Negotiating price','2024-08-29'),
(5,5,2,'2024-08-17 10:00:00','Email','Sent welcome email',NULL);

-- FEEDBACK
INSERT INTO FEEDBACK VALUES
(1,7,'2024-07-01',5,'Service','Excellent support team!'),
(2,8,'2024-07-25',4,'Product','Good product, minor issues'),
(3,9,'2024-08-15',5,'Service','Very satisfied with the service'),
(4,7,'2024-08-01',3,'Product','Product could be improved');

-- COMPLAINT
INSERT INTO COMPLAINT VALUES
(1,8,'2024-07-20','Late Delivery','Order was delayed by 3 days','Resolved'),
(2,9,'2024-08-12','Billing Error','Was charged twice for same item','In-Progress'),
(3,7,'2024-08-05','Product Defect','Item received was damaged','Resolved');

-- RESOLUTION
INSERT INTO RESOLUTION VALUES
(1,1,1,'2024-07-22','Refunded delivery charges and apologized','Accepted'),
(2,3,2,'2024-08-07','Replaced damaged item with new one','Accepted'),
(3,2,1,'2024-08-14','Investigation ongoing, partial refund issued','Escalated');

-- CONVERSION_EVENT
INSERT INTO CONVERSION_EVENT VALUES
(3,7,'2024-06-25',1,'Converted after email campaign follow-up'),
(4,8,'2024-07-18',1,'Converted after product demo'),
(5,9,'2024-08-10',2,'Converted via referral program');

