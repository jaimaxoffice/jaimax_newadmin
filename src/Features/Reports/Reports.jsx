import React, { useState, useEffect } from "react";
import "react-toastify/dist/ReactToastify.css";
import {
  useGetInactiveUsersQuery,
} from "./reportsApiSlice";
// import DetailedBusinessPerformanceReport from "../getBusinessReportFromTo/GetACustomReportOfUsers";
import SimpleBusinessReportPDF from "./SimpleBusinessReportPDF";

const MarketingReports = () => {


  return (
    <div>
     
      <section>
        <SimpleBusinessReportPDF/>
      </section>

      <section>
        <div className="container">
          {/* <DetailedBusinessPerformanceReport /> */}
        </div>
      </section>

      

    </div>
  );
};

export default MarketingReports;