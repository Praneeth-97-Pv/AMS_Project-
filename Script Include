#VoyageIntegrationService 
var VoyageIntegrationService = Class.create();

VoyageIntegrationService.prototype = {

    initialize: function() {},

    getShipmentDetails: function(shipmentId) {

        if (!shipmentId || !/^[A-Za-z0-9_-]+$/.test(
                String(shipmentId))) {
            throw new Error('Invalid shipment ID');
        }

        try {
            var request = new sn_ws.RESTMessageV2(
                'Voyage Shipment Integration',
                'get'
            );

            request.setStringParameterNoEscape(
                'shipment_id',
                encodeURIComponent(String(shipmentId))
            );

            request.setHttpTimeout(15000);

            var response = request.execute();
            var status = response.getStatusCode();

            if (status !== 200) {
                gs.error('Voyage integration failed: HTTP ' + status);
                throw new Error('Shipment lookup failed');
            }

            var shipment = JSON.parse(response.getBody());

            return {
                shipmentId: shipment.shipmentId,
                status: shipment.status,
                estimatedDelivery: shipment.estimatedDelivery,
                currentLocation: shipment.currentLocation
            };

        } catch (ex) {
            gs.error('Voyage integration error: ' + ex.message);
            throw new Error('Unable to retrieve shipment details');
        }
    },

    type: 'VoyageIntegrationService'
};

