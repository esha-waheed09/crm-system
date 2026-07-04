<?php
/**
 * CRMdb Laravel Setup Script
 * Run from inside crm-api folder: php setup.php
 * Writes ALL required files automatically
 */

echo "\n";
echo "================================================\n";
echo " CRMdb Laravel Auto-Setup\n";
echo " Writing all files...\n";
echo "================================================\n\n";

function w($path, $content) {
    $dir = dirname($path);
    if (!is_dir($dir)) mkdir($dir, 0755, true);
    file_put_contents($path, $content);
    echo " OK  $path\n";
}

$b = __DIR__;

// ════════════════════════════════════════════════
// 1. .env
// ════════════════════════════════════════════════
w("$b/.env",
'APP_NAME=CRMdb
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=crm_db
DB_USERNAME=root
DB_PASSWORD=

CACHE_STORE=file
SESSION_DRIVER=file
QUEUE_CONNECTION=sync
');

// ════════════════════════════════════════════════
// 2. bootstrap/app.php
// ════════════════════════════════════════════════
w("$b/bootstrap/app.php",
'<?php
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__."/../routes/web.php",
        api: __DIR__."/../routes/api.php",
        commands: __DIR__."/../routes/console.php",
        health: "/up",
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->api(prepend: [
            \Illuminate\Http\Middleware\HandleCors::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
    })->create();
');

// ════════════════════════════════════════════════
// 3. config/cors.php
// ════════════════════════════════════════════════
w("$b/config/cors.php",
'<?php
return [
    "paths"                    => ["api/*"],
    "allowed_methods"          => ["*"],
    "allowed_origins"          => ["http://localhost:5173","http://127.0.0.1:5173"],
    "allowed_origins_patterns" => [],
    "allowed_headers"          => ["*"],
    "exposed_headers"          => [],
    "max_age"                  => 0,
    "supports_credentials"     => false,
];
');

// ════════════════════════════════════════════════
// 4. routes/api.php
// ════════════════════════════════════════════════
w("$b/routes/api.php",
'<?php
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Api\LeadController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\CampaignController;
use App\Http\Controllers\Api\PipelineStageController;
use App\Http\Controllers\Api\SalesRepController;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\FeedbackController;
use App\Http\Controllers\Api\ComplaintController;
use App\Http\Controllers\Api\ResolutionController;
use App\Http\Controllers\Api\ConversionController;
use App\Http\Controllers\Api\ReportsController;

Route::get("/health", function () {
    try {
        DB::connection()->getPdo();
        $t = DB::select("SHOW TABLES");
        return response()->json(["status"=>"connected","database"=>config("database.connections.mysql.database"),"tables"=>count($t),"time"=>now()->toDateTimeString()]);
    } catch (\Exception $e) {
        return response()->json(["status"=>"disconnected","error"=>$e->getMessage()], 503);
    }
});

Route::get("leads",               [LeadController::class,"index"]);
Route::post("leads",              [LeadController::class,"store"]);
Route::get("leads/{id}",          [LeadController::class,"show"]);
Route::put("leads/{id}",          [LeadController::class,"update"]);
Route::delete("leads/{id}",       [LeadController::class,"destroy"]);
Route::post("leads/{id}/convert", [LeadController::class,"convert"]);

Route::get("customers",           [CustomerController::class,"index"]);
Route::get("customers/{id}",      [CustomerController::class,"show"]);
Route::put("customers/{id}",      [CustomerController::class,"update"]);

Route::get("campaigns",           [CampaignController::class,"index"]);
Route::post("campaigns",          [CampaignController::class,"store"]);
Route::put("campaigns/{id}",      [CampaignController::class,"update"]);
Route::delete("campaigns/{id}",   [CampaignController::class,"destroy"]);

Route::get("pipeline-stages",     [PipelineStageController::class,"index"]);
Route::get("sales-reps",          [SalesRepController::class,"index"]);
Route::get("sales-reps/{id}",     [SalesRepController::class,"show"]);

Route::get("contacts",            [ContactController::class,"index"]);
Route::post("contacts",           [ContactController::class,"store"]);
Route::delete("contacts/{id}",    [ContactController::class,"destroy"]);

Route::get("feedback",            [FeedbackController::class,"index"]);
Route::post("feedback",           [FeedbackController::class,"store"]);

Route::get("complaints",                  [ComplaintController::class,"index"]);
Route::post("complaints",                 [ComplaintController::class,"store"]);
Route::patch("complaints/{id}/resolve",   [ComplaintController::class,"resolve"]);

Route::get("resolutions",         [ResolutionController::class,"index"]);
Route::post("resolutions",        [ResolutionController::class,"store"]);
Route::get("conversions",         [ConversionController::class,"index"]);

Route::get("reports/dashboard-stats",    [ReportsController::class,"dashboardStats"]);
Route::get("reports/campaign-roi",       [ReportsController::class,"campaignROI"]);
Route::get("reports/lead-funnel",        [ReportsController::class,"leadFunnel"]);
Route::get("reports/rep-performance",    [ReportsController::class,"repPerformance"]);
Route::get("reports/avg-feedback",       [ReportsController::class,"avgFeedback"]);
Route::get("reports/unresolved",         [ReportsController::class,"unresolvedComplaints"]);
Route::get("reports/conversion-journey", [ReportsController::class,"conversionJourney"]);
');

// ════════════════════════════════════════════════
// 5. Controllers
// ════════════════════════════════════════════════

w("$b/app/Http/Controllers/Api/LeadController.php",
'<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class LeadController extends Controller {
    public function index() {
        return response()->json(["data" => DB::select("
            SELECT L.Person_ID,P.Person_Name,P.Email,P.Phone,P.Address,
                   L.Campaign_ID,L.Rep_ID,L.Stage_ID,L.Lead_Source,L.Date_Captured,L.Status,
                   PS.Stage_Name,C.Campaign_Name,C.Campaign_Type,
                   REP.Person_Name AS Rep_Name,SR.Employee_ID
            FROM LEADS L
            JOIN PERSON P          ON L.Person_ID=P.Person_ID
            JOIN PIPELINE_STAGE PS ON L.Stage_ID=PS.Stage_ID
            JOIN CAMPAIGN C        ON L.Campaign_ID=C.Campaign_ID
            LEFT JOIN SALES_REP SR ON L.Rep_ID=SR.Person_ID
            LEFT JOIN PERSON REP   ON SR.Person_ID=REP.Person_ID
            ORDER BY L.Date_Captured DESC")]);
    }
    public function show($id) {
        $r = DB::select("SELECT L.*,P.Person_Name,P.Email,PS.Stage_Name,C.Campaign_Name,REP.Person_Name AS Rep_Name FROM LEADS L JOIN PERSON P ON L.Person_ID=P.Person_ID JOIN PIPELINE_STAGE PS ON L.Stage_ID=PS.Stage_ID JOIN CAMPAIGN C ON L.Campaign_ID=C.Campaign_ID LEFT JOIN SALES_REP SR ON L.Rep_ID=SR.Person_ID LEFT JOIN PERSON REP ON SR.Person_ID=REP.Person_ID WHERE L.Person_ID=?",[$id]);
        return empty($r) ? response()->json(["error"=>"Not found"],404) : response()->json(["data"=>$r[0]]);
    }
    public function store(Request $request) {
        $request->validate(["Person_Name"=>"required","Email"=>"required|email|unique:PERSON,Email","Campaign_ID"=>"required","Stage_ID"=>"required"]);
        DB::beginTransaction();
        try {
            DB::table("PERSON")->insert(["Person_Name"=>$request->Person_Name,"Email"=>$request->Email,"Phone"=>$request->Phone??"","Address"=>$request->Address??"","Person_Type"=>"LEAD"]);
            $id = DB::getPdo()->lastInsertId();
            DB::table("LEADS")->insert(["Person_ID"=>$id,"Campaign_ID"=>$request->Campaign_ID,"Rep_ID"=>$request->Rep_ID,"Stage_ID"=>$request->Stage_ID,"Lead_Source"=>$request->Lead_Source??"","Date_Captured"=>$request->Date_Captured??now()->toDateString(),"Status"=>$request->Status??"New"]);
            DB::commit();
            return response()->json(["message"=>"Lead created","Person_ID"=>$id],201);
        } catch(\Exception $e){DB::rollBack();return response()->json(["error"=>$e->getMessage()],500);}
    }
    public function update(Request $request,$id) {
        DB::beginTransaction();
        try {
            if($request->hasAny(["Person_Name","Email","Phone","Address"])) DB::table("PERSON")->where("Person_ID",$id)->update($request->only(["Person_Name","Email","Phone","Address"]));
            if($request->hasAny(["Stage_ID","Status","Rep_ID","Lead_Source"])) DB::table("LEADS")->where("Person_ID",$id)->update($request->only(["Stage_ID","Status","Rep_ID","Lead_Source"]));
            DB::commit(); return response()->json(["message"=>"Updated"]);
        } catch(\Exception $e){DB::rollBack();return response()->json(["error"=>$e->getMessage()],500);}
    }
    public function destroy($id) {
        DB::beginTransaction();
        try {
            DB::table("CONTACT")->where("Lead_ID",$id)->delete();
            DB::table("CONVERSION_EVENT")->where("Lead_ID",$id)->delete();
            DB::table("LEADS")->where("Person_ID",$id)->delete();
            DB::table("PERSON")->where("Person_ID",$id)->delete();
            DB::commit(); return response()->json(["message"=>"Deleted"]);
        } catch(\Exception $e){DB::rollBack();return response()->json(["error"=>$e->getMessage()],500);}
    }
    public function convert($id) {
        $lead = DB::table("LEADS")->where("Person_ID",$id)->first();
        if(!$lead) return response()->json(["error"=>"Not found"],404);
        if(DB::table("CUSTOMER")->where("Person_ID",$id)->first()) return response()->json(["error"=>"Already customer"],409);
        DB::beginTransaction();
        try {
            $today=now()->toDateString();
            DB::table("CUSTOMER")->insert(["Person_ID"=>$id,"Conversion_Date"=>$today,"Total_Purchase_Value"=>0]);
            DB::table("PERSON")->where("Person_ID",$id)->update(["Person_Type"=>"CUSTOMER"]);
            DB::table("LEADS")->where("Person_ID",$id)->update(["Stage_ID"=>5,"Status"=>"Converted"]);
            DB::table("CONVERSION_EVENT")->insert(["Lead_ID"=>$id,"Customer_ID"=>$id,"Conversion_Date"=>$today,"Rep_ID"=>$lead->Rep_ID,"Notes"=>"Converted via CRM"]);
            DB::commit(); return response()->json(["message"=>"Converted","Customer_ID"=>$id]);
        } catch(\Exception $e){DB::rollBack();return response()->json(["error"=>$e->getMessage()],500);}
    }
}');

w("$b/app/Http/Controllers/Api/CustomerController.php",
'<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
class CustomerController extends Controller {
    public function index() {
        return response()->json(["data"=>DB::select("SELECT C.Person_ID,P.Person_Name,P.Email,P.Phone,P.Address,C.Conversion_Date,C.Total_Purchase_Value,ROUND(AVG(F.Rating),2) AS Avg_Rating,COUNT(F.Feedback_ID) AS Total_Feedback FROM CUSTOMER C JOIN PERSON P ON C.Person_ID=P.Person_ID LEFT JOIN FEEDBACK F ON F.Customer_ID=C.Person_ID GROUP BY C.Person_ID,P.Person_Name,P.Email,P.Phone,P.Address,C.Conversion_Date,C.Total_Purchase_Value ORDER BY C.Total_Purchase_Value DESC")]);
    }
    public function show($id) {
        $r=DB::select("SELECT C.*,P.Person_Name,P.Email FROM CUSTOMER C JOIN PERSON P ON C.Person_ID=P.Person_ID WHERE C.Person_ID=?",[$id]);
        return response()->json(["data"=>$r[0]??null]);
    }
    public function update(Request $req,$id) {
        DB::table("CUSTOMER")->where("Person_ID",$id)->update($req->only(["Total_Purchase_Value","Conversion_Date"]));
        return response()->json(["message"=>"Updated"]);
    }
}');

w("$b/app/Http/Controllers/Api/CampaignController.php",
'<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
class CampaignController extends Controller {
    public function index() {
        return response()->json(["data"=>DB::select("SELECT C.*,COUNT(L.Person_ID) AS Total_Leads FROM CAMPAIGN C LEFT JOIN LEADS L ON L.Campaign_ID=C.Campaign_ID GROUP BY C.Campaign_ID,C.Campaign_Name,C.Campaign_Type,C.Start_Date,C.End_Date,C.Budget ORDER BY Total_Leads DESC")]);
    }
    public function show($id){return response()->json(["data"=>DB::table("CAMPAIGN")->find($id)]);}
    public function store(Request $req){
        $req->validate(["Campaign_Name"=>"required"]);
        $id=DB::table("CAMPAIGN")->insertGetId($req->only(["Campaign_Name","Campaign_Type","Start_Date","End_Date","Budget"]));
        return response()->json(["message"=>"Created","id"=>$id],201);
    }
    public function update(Request $req,$id){DB::table("CAMPAIGN")->where("Campaign_ID",$id)->update($req->only(["Campaign_Name","Campaign_Type","Start_Date","End_Date","Budget"]));return response()->json(["message"=>"Updated"]);}
    public function destroy($id){DB::table("CAMPAIGN")->where("Campaign_ID",$id)->delete();return response()->json(["message"=>"Deleted"]);}
}');

w("$b/app/Http/Controllers/Api/PipelineStageController.php",
'<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
class PipelineStageController extends Controller {
    public function index(){
        return response()->json(["data"=>DB::select("SELECT PS.*,COUNT(L.Person_ID) AS Lead_Count FROM PIPELINE_STAGE PS LEFT JOIN LEADS L ON L.Stage_ID=PS.Stage_ID GROUP BY PS.Stage_ID,PS.Stage_Name,PS.Stage_Order,PS.Description ORDER BY PS.Stage_Order")]);
    }
}');

w("$b/app/Http/Controllers/Api/SalesRepController.php",
'<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
class SalesRepController extends Controller {
    public function index(){
        return response()->json(["data"=>DB::select("SELECT SR.*,P.Person_Name,P.Email,COUNT(DISTINCT L.Person_ID) AS Leads_Assigned,COUNT(DISTINCT CE.Lead_ID) AS Conversions FROM SALES_REP SR JOIN PERSON P ON SR.Person_ID=P.Person_ID LEFT JOIN LEADS L ON L.Rep_ID=SR.Person_ID LEFT JOIN CONVERSION_EVENT CE ON CE.Rep_ID=SR.Person_ID GROUP BY SR.Person_ID,SR.Employee_ID,SR.Department,SR.Hire_Date,SR.Commission_Rate,P.Person_Name,P.Email")]);
    }
    public function show($id){$r=DB::select("SELECT SR.*,P.Person_Name FROM SALES_REP SR JOIN PERSON P ON SR.Person_ID=P.Person_ID WHERE SR.Person_ID=?",[$id]);return response()->json(["data"=>$r[0]??null]);}
    public function store(\Illuminate\Http\Request $r){return response()->json(["message"=>"Not implemented"],501);}
    public function update(\Illuminate\Http\Request $r,$id){return response()->json(["message"=>"Not implemented"],501);}
    public function destroy($id){return response()->json(["message"=>"Not implemented"],501);}
}');

w("$b/app/Http/Controllers/Api/ContactController.php",
'<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
class ContactController extends Controller {
    public function index(){
        return response()->json(["data"=>DB::select("SELECT C.*,P.Person_Name AS Lead_Name,P.Email AS Lead_Email,REP.Person_Name AS Rep_Name FROM CONTACT C JOIN LEADS L ON C.Lead_ID=L.Person_ID JOIN PERSON P ON L.Person_ID=P.Person_ID JOIN PERSON REP ON C.Rep_ID=REP.Person_ID ORDER BY C.Contact_Date DESC")]);
    }
    public function store(Request $req){
        $req->validate(["Lead_ID"=>"required","Rep_ID"=>"required","Contact_Type"=>"required"]);
        $id=DB::table("CONTACT")->insertGetId(["Lead_ID"=>$req->Lead_ID,"Rep_ID"=>$req->Rep_ID,"Contact_Date"=>now(),"Contact_Type"=>$req->Contact_Type,"Notes"=>$req->Notes??"","Next_Follow_Up"=>$req->Next_Follow_Up]);
        return response()->json(["message"=>"Logged","id"=>$id],201);
    }
    public function destroy($id){DB::table("CONTACT")->where("Contact_ID",$id)->delete();return response()->json(["message"=>"Deleted"]);}
}');

w("$b/app/Http/Controllers/Api/FeedbackController.php",
'<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
class FeedbackController extends Controller {
    public function index(){
        return response()->json(["data"=>DB::select("SELECT F.*,P.Person_Name AS Customer_Name FROM FEEDBACK F JOIN CUSTOMER C ON F.Customer_ID=C.Person_ID JOIN PERSON P ON C.Person_ID=P.Person_ID ORDER BY F.Feedback_Date DESC")]);
    }
    public function store(Request $req){
        $req->validate(["Customer_ID"=>"required","Rating"=>"required|integer|min:1|max:5"]);
        $id=DB::table("FEEDBACK")->insertGetId(["Customer_ID"=>$req->Customer_ID,"Feedback_Date"=>$req->Feedback_Date??now()->toDateString(),"Rating"=>$req->Rating,"Category"=>$req->Category??"","Comments"=>$req->Comments??""]);
        return response()->json(["message"=>"Recorded","id"=>$id],201);
    }
}');

w("$b/app/Http/Controllers/Api/ComplaintController.php",
'<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
class ComplaintController extends Controller {
    public function index(){
        return response()->json(["data"=>DB::select("SELECT CO.*,P.Person_Name AS Customer_Name FROM COMPLAINT CO JOIN CUSTOMER C ON CO.Customer_ID=C.Person_ID JOIN PERSON P ON C.Person_ID=P.Person_ID ORDER BY CO.Complaint_Date DESC")]);
    }
    public function store(Request $req){
        $req->validate(["Customer_ID"=>"required","Subject"=>"required"]);
        $id=DB::table("COMPLAINT")->insertGetId(["Customer_ID"=>$req->Customer_ID,"Complaint_Date"=>now()->toDateString(),"Subject"=>$req->Subject,"Description"=>$req->Description??"","Status"=>"In-Progress"]);
        return response()->json(["message"=>"Filed","id"=>$id],201);
    }
    public function resolve($id){DB::table("COMPLAINT")->where("Complaint_ID",$id)->update(["Status"=>"Resolved"]);return response()->json(["message"=>"Resolved"]);}
}');

w("$b/app/Http/Controllers/Api/ResolutionController.php",
'<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
class ResolutionController extends Controller {
    public function index(){
        return response()->json(["data"=>DB::select("SELECT R.*,CO.Subject AS Complaint_Subject,P.Person_Name AS Rep_Name,CUST.Person_Name AS Customer_Name FROM RESOLUTION R JOIN COMPLAINT CO ON R.Complaint_ID=CO.Complaint_ID JOIN CUSTOMER C ON CO.Customer_ID=C.Person_ID JOIN PERSON CUST ON C.Person_ID=CUST.Person_ID LEFT JOIN SALES_REP SR ON R.Rep_ID=SR.Person_ID LEFT JOIN PERSON P ON SR.Person_ID=P.Person_ID ORDER BY R.Resolution_Date DESC")]);
    }
    public function store(Request $req){
        $req->validate(["Complaint_ID"=>"required","Resolution_Date"=>"required","Action_Taken"=>"required"]);
        $id=DB::table("RESOLUTION")->insertGetId(["Complaint_ID"=>$req->Complaint_ID,"Rep_ID"=>$req->Rep_ID,"Resolution_Date"=>$req->Resolution_Date,"Action_Taken"=>$req->Action_Taken,"Outcome"=>$req->Outcome??"Accepted"]);
        return response()->json(["message"=>"Saved","id"=>$id],201);
    }
}');

w("$b/app/Http/Controllers/Api/ConversionController.php",
'<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
class ConversionController extends Controller {
    public function index(){
        return response()->json(["data"=>DB::select("SELECT CE.*,PL.Person_Name AS Lead_Name,PC.Person_Name AS Customer_Name,PR.Person_Name AS Rep_Name,CU.Total_Purchase_Value FROM CONVERSION_EVENT CE JOIN PERSON PL ON CE.Lead_ID=PL.Person_ID JOIN PERSON PC ON CE.Customer_ID=PC.Person_ID JOIN PERSON PR ON CE.Rep_ID=PR.Person_ID JOIN CUSTOMER CU ON CE.Customer_ID=CU.Person_ID ORDER BY CE.Conversion_Date DESC")]);
    }
}');

w("$b/app/Http/Controllers/Api/ReportsController.php",
'<?php
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
}');

echo "\n================================================\n";
echo " ALL FILES WRITTEN SUCCESSFULLY!\n";
echo "================================================\n\n";
echo " Now run these 3 commands:\n\n";
echo "   php artisan key:generate\n";
echo "   php artisan optimize:clear\n";
echo "   php artisan serve\n\n";
echo " Then test: http://localhost:8000/api/health\n\n";
