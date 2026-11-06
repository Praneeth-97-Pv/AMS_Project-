// VOYAGE SHIPMENT INTEGRATION SERVICE
var gs = {
    info: function(message) {
        console.log("[INFO] " + message);
    },

    error: function(message) {
        console.error("[ERROR] " + message);
    }
};

// ==============================================
// VOYAGE INTEGRATION SERVICE CLASS
// ==============================================

class VoyageIntegrationService {

    constructor() {
        // Simulated shipment database
        this.shipments = {
            "SHP12345": {
                shipmentId: "SHP12345",
                status: "In Transit",
                estimatedDelivery: "2026-11-10 14:30:00",
                currentLocation: "Chicago Distribution Center"
            },
            "SHP67890": {
                shipmentId: "SHP67890",
                status: "Delivered",
                estimatedDelivery: "2026-11-05 10:00:00",
                currentLocation: "Customer Address"
            }
        };
    }

    // Retrieve shipment details
    getShipmentDetails(shipmentId) {

        if (!shipmentId || typeof shipmentId !== "string") {
            throw new Error("Invalid shipment ID");
        }

        var shipment = this.shipments[shipmentId];

        if (!shipment) {
            throw new Error(
                "Shipment not found: " + shipmentId
            );
        }

        return {
            shipmentId: shipment.shipmentId,
            status: shipment.status,
            estimatedDelivery: shipment.estimatedDelivery,
            currentLocation: shipment.currentLocation
        };
    }
}

// ==============================================
// MAIN PROGRAM
// ==============================================

function main() {

    try {

        // Create Voyage Integration Service
        var voyageService = new VoyageIntegrationService();

        // Retrieve shipment details
        var shipment = voyageService.getShipmentDetails(
            "SHP12345"
        );

        // Display results
        gs.info("Shipment: " + shipment.shipmentId);
        gs.info("Status: " + shipment.status);
        gs.info("ETA: " + shipment.estimatedDelivery);
        gs.info("Current Location: " + shipment.currentLocation);

    } catch (error) {

        gs.error("Error: " + error.message);

    }
}

// Execute program
main();
