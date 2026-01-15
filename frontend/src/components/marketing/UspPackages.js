// UspPackages.js
import React from "react";
import "./UspPackages.css"; // Import the CSS file

const UspPackages = () => {
  return (
    <div className="pricing-section"> {/* White background container */}
      <h1>Choose Your Listing Package:</h1>

      {/* New Wrapper to keep pricing boxes side-by-side */}
      <div className="pricing-wrapper">
        {/* Base Package Box */}
        <div className="pricing-table">
        <table>
          <thead>
            <tr>
              <th>Package</th>
              <th>Full Service (2.25%)</th>
              <th>Premium (3%)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Best for Sellers Who...</strong></td>
              <td>Want full-service marketing & the best price—without staging.</td>
              <td>Want expert staging & a premium selling experience.</td>
            </tr>
            <tr>
              <td><strong>Pricing</strong></td>
              <td> 2.25% of total sales price</td>
              <td> 3% of total sales price</td>
            </tr>
            <tr>
              <td><strong>Professional Photography & Videography</strong></td>
              <td> ✔️</td>
              <td> ✔️</td>
            </tr>
            <tr>
              <td><strong>Maximum Exposure on Zillow, Redfin and More</strong></td>
              <td> ✔️</td>
              <td> ✔️</td>
            </tr>
            <tr>
              <td><strong>Cancel Anytime Guarantee</strong></td>
              <td> ✔️</td>
              <td> ✔️</td>
            </tr>
            <tr>
              <td><strong>Strategic Home Prep</strong></td>
              <td> ❌</td>
              <td> ✔️</td>
            </tr>
            <tr>
              <td><strong>Professional Staging</strong></td>
              <td> ❌</td>
              <td> Free Staging Consultation</td>
            </tr>
          </tbody>
        </table>
      </div>
      </div>
    </div>
  );
};

export default UspPackages;
