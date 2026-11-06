
"use strict";

// =====================================================
// SERVICE NOW INTEGRATION - NODE.JS TEST VERSION
// =====================================================

// Mock database - data exists only while program runs
const db = {
  onboarding: [],
  catsCases: [],
  deliveries: []
};

let nextId = 1;

// Mock logged-in user roles
let currentRole = "";

const gs = {
  hasRole: function(role) {
    return currentRole === role;
  },
  info: function(message) {
    console.log("[INFO]", message);
  },
  error: function(message) {
    console.error("[ERROR]", message);
  }
};

// Generate local record ID
function generateId() {
  return "SYS" + String(nextId++).padStart(5, "0");
}

// Mock request object
function createRequest(data) {
  return {
    body: {
      data: data
    }
  };
}

// Mock response object
function createResponse() {
  return {
    status: 200,
    body: null,

    setStatus: function(status) {
      this.status = status;
    },

    setBody: function(body) {
      this.body = body;
    }
  };
}

// Display response
function printResponse(title, response) {
  console.log("\n================================");
  console.log(title);
  console.log("HTTP Status:", response.status);
  console.log(JSON.stringify(response.body, null, 2));
}

// =====================================================
// 1. CARE AGENT ONBOARDING PORTAL
// =====================================================

function processOnboarding(request, response) {

  if (!gs.hasRole("x_demo.onboarding_integration")) {
    response.setStatus(403);
    response.setBody({ error: "Forbidden" });
    return;
  }

  const data = request.body.data || {};

  const employeeId = String(data.employee_id || "").trim();
  const email = String(data.email || "").trim();

  if (
    !employeeId ||
    !email ||
    !data.first_name ||
    !data.last_name ||
    !data.manager_id
  ) {
    response.setStatus(400);
    response.setBody({
      error: "Required onboarding fields are missing"
    });
    return;
  }

  const existing = db.onboarding.find(
    item => item.employee_id === employeeId
  );

  if (existing) {
    response.setStatus(409);
    response.setBody({
      error: "Onboarding request already exists",
      request_id: existing.sys_id
    });
    return;
  }

  if (data.requested_role !== "care_agent") {
    response.setStatus(400);
    response.setBody({
      error: "Unsupported requested role"
    });
    return;
  }

  const agent = {
    sys_id: generateId(),
    employee_id: employeeId,
    first_name: String(data.first_name),
    last_name: String(data.last_name),
    email: email,
    manager_id: String(data.manager_id),
    requested_role: "care_agent",
    status: "pending_approval"
  };

  db.onboarding.push(agent);

  response.setStatus(201);
  response.setBody({
    request_id: agent.sys_id,
    employee_id: employeeId,
    status: "pending_approval",
    message: "Onboarding request created"
  });
}

// =====================================================
// 2. HR EMPLOYEE INTEGRATION
// =====================================================

class HREmployeeIntegration {

  getEmployee(employeeId) {

    if (!/^[A-Za-z0-9_-]+$/.test(String(employeeId))) {
      throw new Error("Invalid employee ID");
    }

    // Mock HR API response
    const employee = {
      employeeId: String(employeeId),
      active: true,
      department: "Operations",
      managerId: "M100"
    };

    return {
      employeeId: employee.employeeId,
      active: employee.active,
      department: employee.department,
      managerId: employee.managerId
    };
  }
}

// =====================================================
// 3. CATS CUSTOMER APPEALS TRACKING SYSTEM
// =====================================================

function processCatsCase(request, response) {

  if (!gs.hasRole("x_demo.cats_integration")) {
    response.setStatus(403);
    response.setBody({ error: "Forbidden" });
    return;
  }

  const data = request.body.data || {};

  if (
    !data.external_case_id ||
    !data.customer_id ||
    !data.short_description
  ) {
    response.setStatus(400);
    response.setBody({
      error: "Missing required case details"
    });
    return;
  }

  const externalId = String(data.external_case_id);

  const existing = db.catsCases.find(
    item => item.external_case_id === externalId
  );

  if (existing) {
    response.setStatus(200);
    response.setBody({
      case_id: existing.sys_id,
      status: "already_exists"
    });
    return;
  }

  const catsCase = {
    sys_id: generateId(),
    external_case_id: externalId,
    customer_id: String(data.customer_id),
    shipment_id: String(data.shipment_id || ""),
    short_description: String(data.short_description),
    description: String(data.description || ""),
    priority: "2",
    state: "new"
  };

  db.catsCases.push(catsCase);

  response.setStatus(201);
  response.setBody({
    case_id: catsCase.sys_id,
    external_case_id: externalId,
    status: "created"
  });
}

// =====================================================
// 4. VOYAGE SHIPMENT INTEGRATION
// =====================================================

class VoyageShipmentService {

  getShipment(shipmentId) {

    if (!/^[A-Za-z0-9_-]+$/.test(String(shipmentId))) {
      throw new Error("Invalid shipment ID");
    }

    // Mock Voyage REST API
    const shipment = {
      shipmentId: String(shipmentId),
      status: "in_transit",
      estimatedDelivery: "2026-11-07T12:00:00Z",
      currentLocation: "Distribution Hub"
    };

    return {
      shipmentId: shipment.shipmentId,
      status: shipment.status,
      eta: shipment.estimatedDelivery,
      location: shipment.currentLocation
    };
  }
}

// =====================================================
// 5. DELIVERY IMPACT CALCULATOR
// =====================================================

class DeliveryImpactCalculator {

  calculate(eta, windowHours, rate) {

    if (
      eta === null || eta === undefined || eta === "" ||
      windowHours === null || windowHours === undefined ||
      windowHours === "" ||
      rate === null || rate === undefined || rate === ""
    ) {
      throw new Error("Missing numeric inputs");
    }

    eta = Number(eta);
    windowHours = Number(windowHours);
    rate = Number(rate);

    if (
      !Number.isFinite(eta) ||
      !Number.isFinite(windowHours) ||
      !Number.isFinite(rate) ||
      eta < 0 ||
      windowHours < 0 ||
      rate < 0
    ) {
      throw new Error("Invalid numeric inputs");
    }

    const allowedMinutes = windowHours * 60;

    const delayedMinutes = Math.max(
      0,
      eta - allowedMinutes
    );

    const impact = Math.round(
      delayedMinutes * rate * 100
    ) / 100;

    return {
      delayed: delayedMinutes > 0,
      delay_minutes: delayedMinutes,
      calculated_impact: impact,
      status: delayedMinutes > 0 ? "delayed" : "on_time"
    };
  }
}

// =====================================================
// 6. DELIVERY DELAY AUTOMATION
// =====================================================

function processRouteCalculation(request, response) {

  if (!gs.hasRole("x_demo.route_integration")) {
    response.setStatus(403);
    response.setBody({ error: "Forbidden" });
    return;
  }

  const body = request.body.data || {};
  const routeId = String(body.route_id || "");

  if (!/^[A-Za-z0-9_-]+$/.test(routeId)) {
    response.setStatus(400);
    response.setBody({ error: "Invalid route ID" });
    return;
  }

  let calculation;

  try {
    const calculator = new DeliveryImpactCalculator();

    calculation = calculator.calculate(
      body.eta_minutes,
      body.delivery_window_hours,
      body.penalty_rate
    );

  } catch (error) {
    response.setStatus(400);
    response.setBody({
      error: "Invalid delivery calculation data"
    });
    return;
  }

  let record = db.deliveries.find(
    item => item.route_id === routeId
  );

  const isNew = !record;

  if (isNew) {
    record = {
      sys_id: generateId(),
      route_id: routeId
    };
    db.deliveries.push(record);
  }

  record.eta_minutes = Number(body.eta_minutes);
  record.delivery_window_hours =
    Number(body.delivery_window_hours);
  record.penalty_rate = Number(body.penalty_rate);
  record.delay_minutes = calculation.delay_minutes;
  record.calculated_impact =
    calculation.calculated_impact;
  record.status = calculation.status;

  response.setStatus(isNew ? 201 : 200);

  response.setBody({
    route_id: routeId,
    delay_minutes: calculation.delay_minutes,
    calculated_impact: calculation.calculated_impact,
    status: calculation.status,
    record_id: record.sys_id
  });
}

// =====================================================
// 7. DELIVERY STATUS INTEGRATION
// =====================================================

class DeliveryStatusIntegration {

  updateStatus(routeId, status) {

    if (!/^[A-Za-z0-9_-]+$/.test(String(routeId))) {
      throw new Error("Invalid route ID");
    }

    const allowed = {
      dispatched: true,
      delayed: true,
      on_time: true
    };

    if (!allowed[status]) {
      throw new Error("Invalid delivery status");
    }

    // Simulated successful outbound PATCH response
    return {
      success: true,
      route_id: String(routeId),
      status: status
    };
  }
}

// =====================================================
// 8. DELIVERY INSTANCE - RECEIVING API
// =====================================================

function processDeliveryStatus(request, response) {

  if (!gs.hasRole("x_demo.delivery_integration")) {
    response.setStatus(403);
    response.setBody({ error: "Forbidden" });
    return;
  }

  const body = request.body.data || {};
  const routeId = String(body.route_id || "");
  const status = String(body.status || "");

  const allowed = {
    dispatched: true,
    delayed: true,
    on_time: true
  };

  if (
    !/^[A-Za-z0-9_-]+$/.test(routeId) ||
    !allowed[status]
  ) {
    response.setStatus(400);
    response.setBody({
      error: "Invalid route or status"
    });
    return;
  }

  const delivery = db.deliveries.find(
    item => item.route_id === routeId
  );

  if (!delivery) {
    response.setStatus(404);
    response.setBody({
      error: "Route not found"
    });
    return;
  }

  delivery.status = status;

  response.setStatus(200);
  response.setBody({
    route_id: routeId,
    status: status,
    synchronized: true
  });
}

// =====================================================
// 9. TEST EXECUTION - MAIN FUNCTION
// =====================================================

function runTest(title, role, handler, data) {

  currentRole = role;

  const request = createRequest(data);
  const response = createResponse();

  handler(request, response);

  printResponse(title, response);
}

// =====================================================
// MAIN PROGRAM
// =====================================================

function main() {

  console.log("SERVICENOW INTEGRATION TEST STARTED");

  // Test 1: Care Agent Onboarding
  runTest(
    "CARE AGENT ONBOARDING",
    "x_demo.onboarding_integration",
    processOnboarding,
    {
      employee_id: "EMP101",
      first_name: "Alex",
      last_name: "Taylor",
      email: "alex@example.com",
      manager_id: "M100",
      requested_role: "care_agent"
    }
  );

  // Test 2: HR Integration
  console.log("\nHR EMPLOYEE INTEGRATION");

  const hrService = new HREmployeeIntegration();

  console.log(
    JSON.stringify(
      hrService.getEmployee("EMP101"),
      null,
      2
    )
  );

  // Test 3: CATS Case Creation
  runTest(
    "CATS CASE CREATION",
    "x_demo.cats_integration",
    processCatsCase,
    {
      external_case_id: "CASE101",
      customer_id: "CUST100",
      shipment_id: "SHIP101",
      short_description: "Shipment delayed",
      description: "Customer reported delivery delay"
    }
  );

  // Test 4: Voyage Integration
  console.log("\nVOYAGE SHIPMENT INTEGRATION");

  const voyageService = new VoyageShipmentService();

  console.log(
    JSON.stringify(
      voyageService.getShipment("SHIP101"),
      null,
      2
    )
  );

  // Test 5: Delivery Delay Calculation
  runTest(
    "DELIVERY DELAY CALCULATION",
    "x_demo.route_integration",
    processRouteCalculation,
    {
      route_id: "ROUTE101",
      eta_minutes: 180,
      delivery_window_hours: 2,
      penalty_rate: 1.5
    }
  );

  // Test 6: Delivery Status Update
  runTest(
    "DELIVERY STATUS SYNCHRONIZATION",
    "x_demo.delivery_integration",
    processDeliveryStatus,
    {
      route_id: "ROUTE101",
      status: "dispatched"
    }
  );

  // Test 7: Outbound Delivery Integration
  console.log("\nOUTBOUND DELIVERY INTEGRATION");

  const deliveryService = new DeliveryStatusIntegration();

  console.log(
    JSON.stringify(
      deliveryService.updateStatus(
        "ROUTE101",
        "delayed"
      ),
      null,
      2
    )
  );

  console.log("\nALL TEST SCENARIOS COMPLETED");
}

// Execute main
main();
