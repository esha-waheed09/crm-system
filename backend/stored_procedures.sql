-- ============================================================
-- CRM Database — Stored Procedures & Functions
-- ============================================================

USE crm_db;

DELIMITER //

-- ─────────────────────────────────────────────────────────────
-- STORED PROCEDURE 1: sp_CampaignROI
-- Returns budget vs revenue ROI for all campaigns
-- Usage: CALL sp_CampaignROI();
-- ─────────────────────────────────────────────────────────────
CREATE PROCEDURE sp_CampaignROI()
BEGIN
    SELECT
        c.Campaign_Name,
        c.Campaign_Type,
        c.Budget,
        COUNT(DISTINCT l.Person_ID)                         AS Total_Leads,
        COUNT(DISTINCT ce.Lead_ID)                          AS Conversions,
        COALESCE(SUM(cu.Total_Purchase_Value), 0)           AS Revenue_Generated,
        ROUND(
            (COALESCE(SUM(cu.Total_Purchase_Value), 0) - c.Budget)
            / c.Budget * 100, 1
        )                                                   AS ROI_Percent
    FROM CAMPAIGN c
    LEFT JOIN LEADS            l  ON l.Campaign_ID  = c.Campaign_ID
    LEFT JOIN CONVERSION_EVENT ce ON ce.Lead_ID     = l.Person_ID
    LEFT JOIN CUSTOMER         cu ON cu.Person_ID   = ce.Customer_ID
    GROUP BY c.Campaign_ID, c.Campaign_Name, c.Campaign_Type, c.Budget
    ORDER BY ROI_Percent DESC;
END //

-- ─────────────────────────────────────────────────────────────
-- STORED PROCEDURE 2: sp_LeadFunnel
-- Returns lead count and % at each pipeline stage
-- Usage: CALL sp_LeadFunnel();
-- ─────────────────────────────────────────────────────────────
CREATE PROCEDURE sp_LeadFunnel()
BEGIN
    SELECT
        ps.Stage_Name,
        ps.Stage_Order,
        COUNT(l.Person_ID)  AS Lead_Count,
        ROUND(
            COUNT(l.Person_ID) * 100.0
            / NULLIF((SELECT COUNT(*) FROM LEADS), 0), 1
        )                   AS Pct_of_Total
    FROM PIPELINE_STAGE ps
    LEFT JOIN LEADS l ON l.Stage_ID = ps.Stage_ID
    GROUP BY ps.Stage_ID, ps.Stage_Name, ps.Stage_Order
    ORDER BY ps.Stage_Order;
END //

-- ─────────────────────────────────────────────────────────────
-- STORED PROCEDURE 3: sp_RepReport(rep_id)
-- Detailed report for a single sales rep
-- Usage: CALL sp_RepReport(1);
-- ─────────────────────────────────────────────────────────────
CREATE PROCEDURE sp_RepReport(IN p_rep_id INT)
BEGIN
    SELECT
        P.Person_Name         AS Rep_Name,
        SR.Employee_ID,
        SR.Commission_Rate,
        COUNT(DISTINCT L.Person_ID)    AS Leads_Assigned,
        COUNT(DISTINCT CE.Lead_ID)     AS Conversions,
        COALESCE(SUM(C.Total_Purchase_Value), 0) AS Revenue_Closed,
        ROUND(COUNT(DISTINCT CE.Lead_ID) * 100.0
              / NULLIF(COUNT(DISTINCT L.Person_ID), 0), 1) AS Conversion_Rate
    FROM SALES_REP SR
    JOIN PERSON P       ON SR.Person_ID = P.Person_ID
    LEFT JOIN LEADS L   ON L.Rep_ID     = SR.Person_ID
    LEFT JOIN CONVERSION_EVENT CE ON CE.Rep_ID = SR.Person_ID
    LEFT JOIN CUSTOMER C ON C.Person_ID = CE.Customer_ID
    WHERE SR.Person_ID = p_rep_id
    GROUP BY P.Person_Name, SR.Employee_ID, SR.Commission_Rate;
END //

DELIMITER ;

-- ─────────────────────────────────────────────────────────────
-- USER-DEFINED FUNCTION: fn_LeadAge
-- Returns number of days since a lead was captured
-- Usage: SELECT Person_ID, fn_LeadAge(Date_Captured) AS Days_Old FROM LEADS;
-- ─────────────────────────────────────────────────────────────
DELIMITER //
CREATE FUNCTION fn_LeadAge(captured_date DATE)
RETURNS INT
DETERMINISTIC
BEGIN
    RETURN DATEDIFF(CURDATE(), captured_date);
END //
DELIMITER ;

-- ─────────────────────────────────────────────────────────────
-- ALTER TABLE Examples
-- ─────────────────────────────────────────────────────────────

-- Add Customer Segment column
ALTER TABLE CUSTOMER
  ADD COLUMN Customer_Segment VARCHAR(50) DEFAULT 'Standard';

-- Modify Lead Status to ENUM
ALTER TABLE LEADS
  MODIFY COLUMN Status ENUM('New','In-Progress','Converted','Lost') NOT NULL DEFAULT 'New';

-- Add index for faster contact lookups by date
ALTER TABLE CONTACT
  ADD INDEX idx_contact_date (Contact_Date);

-- Add index on Lead Date_Captured for date range queries
ALTER TABLE LEADS
  ADD INDEX idx_lead_captured (Date_Captured);

-- ─────────────────────────────────────────────────────────────
-- COMPLEX SELECT Queries (Lab 09 Queries)
-- ─────────────────────────────────────────────────────────────

-- Q1: Leads with rep and stage
SELECT P.Person_Name AS Lead_Name, PS.Stage_Name, SR_P.Person_Name AS Rep
FROM LEADS L
JOIN PERSON P          ON L.Person_ID  = P.Person_ID
JOIN PIPELINE_STAGE PS ON L.Stage_ID   = PS.Stage_ID
LEFT JOIN SALES_REP SR ON L.Rep_ID     = SR.Person_ID
LEFT JOIN PERSON SR_P  ON SR.Person_ID = SR_P.Person_ID;

-- Q2: Leads per campaign
SELECT C.Campaign_Name, COUNT(L.Person_ID) AS Total_Leads
FROM CAMPAIGN C
LEFT JOIN LEADS L ON C.Campaign_ID = L.Campaign_ID
GROUP BY C.Campaign_Name
ORDER BY Total_Leads DESC;

-- Q3: Customers by purchase value
SELECT P.Person_Name, C.Conversion_Date, C.Total_Purchase_Value
FROM CUSTOMER C
JOIN PERSON P ON C.Person_ID = P.Person_ID
ORDER BY C.Total_Purchase_Value DESC;

-- Q4: Unresolved complaints
SELECT P.Person_Name, CO.Subject, CO.Complaint_Date, CO.Status
FROM COMPLAINT CO
JOIN CUSTOMER C ON CO.Customer_ID = C.Person_ID
JOIN PERSON P   ON C.Person_ID    = P.Person_ID
WHERE CO.Status != 'Resolved';

-- Q5: Avg feedback per customer
SELECT P.Person_Name, AVG(F.Rating) AS Avg_Rating, COUNT(F.Feedback_ID) AS Total
FROM FEEDBACK F
JOIN CUSTOMER C ON F.Customer_ID = C.Person_ID
JOIN PERSON   P ON C.Person_ID   = P.Person_ID
GROUP BY P.Person_Name;

-- Q6: Sales rep performance
SELECT P.Person_Name AS Rep_Name,
       COUNT(DISTINCT L.Person_ID) AS Leads_Assigned,
       COUNT(DISTINCT CE.Lead_ID)  AS Conversions
FROM SALES_REP SR
JOIN PERSON P       ON SR.Person_ID = P.Person_ID
LEFT JOIN LEADS L   ON L.Rep_ID     = SR.Person_ID
LEFT JOIN CONVERSION_EVENT CE ON CE.Rep_ID = SR.Person_ID
GROUP BY P.Person_Name;

-- Q7: Contacts with follow-up dates
SELECT P.Person_Name AS Lead_Name, C.Contact_Type, C.Contact_Date, C.Next_Follow_Up
FROM CONTACT C
JOIN LEADS L  ON C.Lead_ID   = L.Person_ID
JOIN PERSON P ON L.Person_ID = P.Person_ID
ORDER BY C.Contact_Date;

-- Q8: Full conversion journey
SELECT PL.Person_Name AS Lead_Name, PC.Person_Name AS Customer_Name,
       CE.Conversion_Date, PR.Person_Name AS Rep_Name
FROM CONVERSION_EVENT CE
JOIN PERSON PL ON CE.Lead_ID     = PL.Person_ID
JOIN PERSON PC ON CE.Customer_ID = PC.Person_ID
JOIN PERSON PR ON CE.Rep_ID      = PR.Person_ID;
