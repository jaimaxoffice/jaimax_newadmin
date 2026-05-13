import React, { useState, useEffect } from "react";
import "react-toastify/dist/ReactToastify.css";

import DetailedBusinessPerformanceReport from "../BusinessFrom$To/DetailedBusinessPerformanceReport";
import SimpleBusinessReportPDF from "./SimpleBusinessReportPDF";

const MarketingReports = () => {


  return (
    <div>

      <section>
        <SimpleBusinessReportPDF />
      </section>

      <section>
        <div className="container">
          <DetailedBusinessPerformanceReport />
        </div>
      </section>



    </div>
  );
};

export default MarketingReports;