/**
 * @class Oskari.analysis.bundle.analyse.AnalyseService
 * Methods for sending out analysis data to backend
 */
Oskari.clazz.define(
    'Oskari.analysis.bundle.analyse.service.AnalyseService',

    /**
     * @static @method create called automatically on construction
     *
     *
     */
    function (instance) {
        this.instance = instance;
        this.sandbox = instance.sandbox;
        this.loc = instance.loc;
    }, {
        __name: 'Analyse.AnalyseService',
        __qname: 'Oskari.analysis.bundle.analyse.service.AnalyseService',

        getQName: function () {
            return this.__qname;
        },

        getName: function () {
            return this.__name;
        },

        /**
         * @public @method init
         * Initializes the service
         *
         *
         */
        init: function () {

        },

        /**
         * @public @method sendAnalyseData
         * Sends the data to backend for analysis.
         *
         * @param {Object} data the data to send
         * @param {Function} success the success callback
         * @param {Function} failure the failure callback
         *
         */
        sendAnalyseData: function (data, success, failure) {
            var url = Oskari.urls.getRoute('CreateAnalysisLayer');
            jQuery.ajax({
                type: 'POST',
                dataType: 'json',
                url: url,
                beforeSend: function (x) {
                    if (x && x.overrideMimeType) {
                        x.overrideMimeType('application/j-son;charset=UTF-8');
                    }
                },
                data: data,
                success: success,
                error: failure
            });
        },

        /**
         * @method getAnalyseLayers
         * Get analysis layers.
         *
         * @param {Function} success2 the success callback
         * @param {Function} failure the failure callback
         *
         */
        _getAnalysisLayers: function (mysuccess, failure) {
            var url = Oskari.urls.getRoute('GetAnalysisLayers');
            jQuery.ajax({
                type: 'GET',
                dataType: 'json',
                url: url,
                beforeSend: function (x) {
                    if (x && x.overrideMimeType) {
                        x.overrideMimeType('application/j-son;charset=UTF-8');
                    }
                },
                success: mysuccess,
                error: failure
            });
        },

        /**
         * @private @method _loadAnalyseLayers
         * Load analysis layers in start.
         *
         *
         */
        loadAnalyseLayers: function () {
            var me = this;

            // Request analyis layers via the backend
            me._getAnalysisLayers(
                // Success callback
                function (response) {
                    if (response) {
                        me._handleAnalysisLayersResponse(response);
                    }
                },
                // Error callback
                function (jqXHR, textStatus, errorThrown) {
                    me.instance.showMessage(me.loc('AnalyseView.error.title'), me.loc('AnalyseView.error.loadLayersFailed'));
                }
            );
        },

        /**
         * @private @method handleAnalysisLayersResponse
         * Put analysislayers to map and subsequently to be used in further analysis.
         *
         * @param {JSON} analyseJson analysislayers JSON returned by server.
         *
         */
        _handleAnalysisLayersResponse: function (analysislayersJson) {
            // TODO: some error checking perhaps?
            var me = this,
                sandbox = me.instance.getSandbox(),
                mapLayerService,
                mapLayer,
                layerarr = analysislayersJson.analysislayers,
                i,
                analyseJson;

            this.analyseLayers = [];

            for (i in layerarr) {
                if (layerarr.hasOwnProperty(i)) {
                    analyseJson = layerarr[i];
                    this.analyseLayers.push(analyseJson);
                    // TODO: Handle WPS results when no FeatureCollection eg. aggregate
                    if (analyseJson.wpsLayerId + '' === '-1') {
                        // no analyse layer case  eg. aggregate wps function
                        //  this.instance.showMessage("Tulokset", analyseJson.result);
                    } else {
                        mapLayerService = this.instance.mapLayerService;
                        mapLayer = mapLayerService.createMapLayer(analyseJson);
                        // Add the layer to the map layer service
                        mapLayerService.addLayer(mapLayer, true);
                    }
                }
            }

            if (layerarr && layerarr.length > 0) {
                // notify components of added layer if not suppressed
                var evt = Oskari.eventBuilder('MapLayerEvent')(null, 'add');
                sandbox.notifyAll(evt); // add the analysis layers programmatically since normal link processing
            }
        },

        /**
         * @private @method _getWFSLayerPropertiesAndTypes
         * Get WFS layer properties and property types
         *
         * @param {Function} success2 the success callback
         * @param {Function} failure the failure callback
         *
         */
        _getWFSLayerPropertiesAndTypes: function (layer_id, success, failure) {
            fetch(Oskari.urls.getRoute('DescribeLayer', { id: layer_id }), {
                method: 'GET',
                headers: {
                    Accept: 'application/json'
                }
            }).then(response => {
                return response.json();
            }).then(json => {
                success.call(json);
            });


        },

        /**
         * @private @method loadWFSLayerPropertiesAndTypes
         * Load analysis layers in start.
         *
         *
         */
        loadWFSLayerPropertiesAndTypes: function (layerId) {
            var me = this;

            // Request analyis layers via the backend
            me._getWFSLayerPropertiesAndTypes(layerId,
                // Success callback
                function (response) {
                    if (response) {
                        me._handleWFSLayerPropertiesAndTypesResponse(layerId, response);
                    }
                },
                // Error callback
                function (jqXHR, textStatus, errorThrown) {
                    me.instance.showMessage(me.loc('AnalyseView.error.title'), me.loc('AnalyseView.error.loadLayerTypesFailed'));
                });
        },

        /**
         * @private @method _handleWFSLayerPropertiesAndTypesResponse
         * Put property types to WFS and analysis layer
         *
         * @param {JSON} propertyJson properties and property types of WFS layer JSON returned by server.
         *
         */
        _handleWFSLayerPropertiesAndTypesResponse: function (layerId, propertyJson) {
            const layer = this.instance.getSandbox().findMapLayerFromSelectedMapLayers(layerId);
            const types = {};
            propertyJson.properties.forEach(property => types[property.name] = property.type );
            if (layer) {
                layer.setPropertyTypes(types);
            }
        },
    }, {
        protocol: ['Oskari.mapframework.service.Service']
    }
);
