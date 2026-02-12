import React, { useState, useEffect } from "react";
import { Modal, Button } from "react-bootstrap";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DashboardLayout from "../../Layout/DashboardLayout";
import {
  useGetInactiveUsersQuery,
} from "./reportsApiSlice";
import DetailedBusinessPerformanceReport from "../getBusinessReportFromTo/GetACustomReportOfUsers";
import SimpleBusinessReportPDF from "./SimpleBusinessReportPDF";

const MarketingReports = () => {


  return (
    <div>
     
      <section>
        <SimpleBusinessReportPDF/>
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