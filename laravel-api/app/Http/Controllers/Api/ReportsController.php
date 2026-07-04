<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
class ReportsController extends Controller {
    public function dashboardStats(){
        return response()->json([
            "leads"            => DB::table("LEADS")->count(),
            "new_leads"        => DB::table("LEADS")->where("Status","New")->count(),
            "customers"        => DB::table("CUSTOMER")->count(),
            "total_revenue"    => (float)DB::table("CUSTOMER")->sum("Total_Purchase_Value"),
            "campaigns"        => DB::table("CAMPAIGN")->count(),
            "total_budget"     => (float)DB::table("CAMPAIGN")->sum("Budget"),
            "contacts"         => DB::table("CONTACT")->count(),
            "avg_rating"       => round((float)DB::table("FEEDBACK")->avg("Rating"),1),
            "open_complaints"  => DB::table("COMPLAINT")->where("Status","!=","Resolved")->count(),
            "total_complaints" => DB::table("COMPLAINT")->count(),
            "conversions"      => DB::table("CONVERSION_EVENT")->count(),
        ]);
    }
    public function campaignROI(){
        try{$r=DB::select("CALL sp_CampaignROI()");}
        catch(\Exception $e){$r=DB::select("SELECT c.Campaign_Name,c.Campaign_Type,c.Budget,COUNT(DISTINCT l.Person_ID) AS Total_Leads,COUNT(DISTINCT ce.Lead_ID) AS Conversions,COALESCE(SUM(cu.Total_Purchase_Value),0) AS Revenue_Generated,ROUND((COALESCE(SUM(cu.Total_Purchase_Value),0)-c.Budget)/c.Budget*100,1) AS ROI_Percent FROM CAMPAIGN c LEFT JOIN LEADS l ON l.Campaign_ID=c.Campaign_ID LEFT JOIN CONVERSION_EVENT ce ON ce.Lead_ID=l.Person_ID LEFT JOIN CUSTOMER cu ON cu.Person_ID=ce.Customer_ID GROUP BY c.Campaign_ID,c.Campaign_Name,c.Campaign_Type,c.Budget ORDER BY ROI_Percent DESC");}
        return response()->json(["data"=>$r]);
    }
    public function leadFunnel(){
        try{$r=DB::select("CALL sp_LeadFunnel()");}
        catch(\Exception $e){$r=DB::select("SELECT ps.Stage_Name,ps.Stage_Order,COUNT(l.Person_ID) AS Lead_Count,ROUND(COUNT(l.Person_ID)*100.0/NULLIF((SELECT COUNT(*) FROM LEADS),0),1) AS Pct_of_Total FROM PIPELINE_STAGE ps LEFT JOIN LEADS l ON l.Stage_ID=ps.Stage_ID GROUP BY ps.Stage_ID,ps.Stage_Name,ps.Stage_Order ORDER BY ps.Stage_Order");}
        return response()->json(["data"=>$r]);
    }
    public function repPerformance(){
        return response()->json(["data"=>DB::select("SELECT P.Person_Name AS Rep_Name,SR.Employee_ID,SR.Commission_Rate,COUNT(DISTINCT L.Person_ID) AS Leads_Assigned,COUNT(DISTINCT CE.Lead_ID) AS Conversions,ROUND(COUNT(DISTINCT CE.Lead_ID)*100.0/NULLIF(COUNT(DISTINCT L.Person_ID),0),1) AS Conversion_Rate FROM SALES_REP SR JOIN PERSON P ON SR.Person_ID=P.Person_ID LEFT JOIN LEADS L ON L.Rep_ID=SR.Person_ID LEFT JOIN CONVERSION_EVENT CE ON CE.Rep_ID=SR.Person_ID GROUP BY SR.Person_ID,P.Person_Name,SR.Employee_ID,SR.Commission_Rate")]);
    }
    public function avgFeedback(){
        return response()->json(["data"=>DB::select("SELECT P.Person_Name,ROUND(AVG(F.Rating),2) AS Avg_Rating,COUNT(F.Feedback_ID) AS Total_Feedback,C.Total_Purchase_Value FROM FEEDBACK F JOIN CUSTOMER C ON F.Customer_ID=C.Person_ID JOIN PERSON P ON C.Person_ID=P.Person_ID GROUP BY P.Person_Name,C.Total_Purchase_Value ORDER BY Avg_Rating DESC")]);
    }
    public function unresolvedComplaints(){
        return response()->json(["data"=>DB::select("SELECT P.Person_Name,CO.Complaint_ID,CO.Subject,CO.Complaint_Date,CO.Status,CO.Description FROM COMPLAINT CO JOIN CUSTOMER C ON CO.Customer_ID=C.Person_ID JOIN PERSON P ON C.Person_ID=P.Person_ID WHERE CO.Status != \"Resolved\" ORDER BY CO.Complaint_Date ASC")]);
    }
    public function conversionJourney(){
        return response()->json(["data"=>DB::select("SELECT PL.Person_Name AS Lead_Name,PC.Person_Name AS Customer_Name,CE.Conversion_Date,PR.Person_Name AS Rep_Name,CE.Notes,CU.Total_Purchase_Value FROM CONVERSION_EVENT CE JOIN PERSON PL ON CE.Lead_ID=PL.Person_ID JOIN PERSON PC ON CE.Customer_ID=PC.Person_ID JOIN PERSON PR ON CE.Rep_ID=PR.Person_ID JOIN CUSTOMER CU ON CE.Customer_ID=CU.Person_ID ORDER BY CE.Conversion_Date DESC")]);
    }
}