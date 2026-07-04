<?php
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
