This module implements a reporting engine for the POS front-end, aiming to facilitate the insertion of new reports, centralizing and standardizing them.

In this way, it is possible to add reports with specific data inputs, just by extending this module and using a simple interface.


To add a report, you need to:

1. Use the ReportEngine object already exported by this module

   const ReportEngine = require("pos_report_engine.ReportEngine");


2. Register the new report by passing an object in the following format to the "addReport()" function of the "ReportEngine" object:

  report:
  {   id: string -> report id

      name: string -> Report button name

      reportGeneratorHandle: Function -> Function responsible for generating and returning the report

      reportInputs: list -> List of data input component objects for report generation   }



  report_input_object:
  {   id: string -> ID used to capture input value

      component: class -> Input component class

      label: string -> Input field label }


See the examples folder for more details
