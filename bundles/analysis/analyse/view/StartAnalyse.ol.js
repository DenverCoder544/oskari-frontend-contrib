import olFormatGeoJSON from 'ol/format/GeoJSON';
import { COLORS, FILL_COLORS, DEFAULT_STYLE } from './constants';
import { showStyleEditor } from './StyleForm';
/**
 * @class Oskari.analysis.bundle.analyse.view.StartAnalyse
 * Request the analyse params and layers and triggers analyse actions
 * Analyses data  and save results
 *
 */

Oskari.clazz.define('Oskari.analysis.bundle.analyse.view.StartAnalyse',

    /**
     * @static @method create called automatically on construction
     *
     * @param {Oskari.analysis.bundle.analyse.AnalyseBundleInstance} instance
     * reference to component that created this panel view
     * @param {Object} localization
     * localization data in JSON format
     *
     */
    function (instance, localization) {
        var me = this,
            p;

        me.isEnabled = false;
        me.instance = instance;
        me.loc = localization;
        me.id_prefix = 'oskari_analyse_';
        me.layer_prefix = 'analysis_';
        me.max_analyse_layer_fields = 10;
        me.max_areaCount = 12;
        me._fixedDecimalCount = 2;
        // unit -> multiplier
        me.bufferUnits = {
            'm': 1,
            'km': 1000
        };

        /* templates */
        me.template = {};
        for (p in me.__templates) {
            if (me.__templates.hasOwnProperty(p)) {
                me.template[p] = jQuery(me.__templates[p]);
            }
        }

        /* Analyse method options in localisations */
        me.methodOptions = me.loc.method.options;
        me.methodOptionsMap = {};
        me.methodOptions.forEach(function (option) {
            me.methodOptionsMap[option.id] = option;
        });

        /* parameter options listed in localisations */
        me.paramsOptions = me.loc.params.options;
        me.paramsOptionsMap = {};
        me.paramsOptions.forEach(function (option) {
            me.paramsOptionsMap[option.id] = option;
        });

        /* aggregate options listed in localisations */
        me.aggreOptions = me.loc.aggregate.options;
        me.aggreOptionsMap = {};
        me.aggreOptions.forEach(function (option) {
            me.aggreOptionsMap[option.id] = option;
        });

        /* spatial options listed in localisations for intersect */
        me.spatialOptions = me.loc.spatial.options;
        me.spatialOptionsMap = {};
        me.spatialOptions.forEach(function (option) {
            me.spatialOptionsMap[option.id] = option;
        });

        // content options listed in localisations
        me.contentOptionsMap = {};
        me.intersectOptionsMap = {};
        me.unionOptionsMap = {};

        me.contentOptions = {};
        me.intersectOptions = {};
        me.unionOptions = {};

        me._ownStyle = null;
        me._popupControls = null;

        me.accordion = null;
        me.mainPanel = null;

        me.alert = Oskari.clazz.create('Oskari.userinterface.component.Alert');

        me.previewContent = null;
        me.previewImgDiv = null;

        me.contentOptionDivs = {};

        me.paramsOptionDivs = {};
        me.aggreOptionDivs = {};

        me._filterJsons = {};
        me._filterPopups = {};

        me._userSetFilter = {};

        me.WFSLayerService = me.instance.getSandbox().getService('Oskari.mapframework.bundle.mapwfs2.service.WFSLayerService');
        me._param_footer = me.template.footer.clone();
        me._param_footer.append(this.loc.aggregate.footer);
        me._showFeatureDataAfterAnalysis = null;
        me._showFeatureDataWithoutSaving = null;
    }, {
        __templates: {
            content: '<div class="layer_data"></div>',
            icons_layer:
                '<table class=layer-icons>' +
                '  <tr>' +
                '    <td>' +
                '      <div class="layer-icon layer-wfs" title="Tietotuote"></div>' +
                '    </td>' +
                '    <td>' +
                '      <div class="layer-info icon-info"></div>' +
                '    </td>' +
                '    <td>' +
                '      <div class="filter icon-funnel-active"></div>' +
                '    </td>' +
                '    <td>' +
                '      <div class="icon-close"></div>' +
                '    </td>' +
                '  </tr>' +
                '</table>',
            icons_temp_layer: '<div class="icon-close"></div>',
            tool:
                '<div class="tool ">' +
                '  <input type="checkbox"/>' +
                '  <label></label>' +
                '</div>',
            buttons: '<div class="buttons"></div>',
            help: '<div class="help icon-info"></div>',
            main:
                '<div class="basic_analyse">' +
                '  <div class="header">' +
                '    <div class="icon-close"></div>' +
                '    <h3></h3>' +
                '  </div>' +
                '  <div class="content"></div>' +
                '</div>',
            columnsContainer: '<div class="analyse-columns-container"></div>',
            columnsDropdown:
                '<select class="analyse-columns-dropdown"></select>',
            paramsOptionExtra: '<div class="extra_params"></div>',
            option:
                '<div class="analyse_option_cont analyse_settings_cont">' +
                '  <label>' +
                '    <input type="radio" name="selectedlayer" />' +
                '    <span></span>' +
                '  </label>' +
                '</div>',
            checkboxToolOptíon:
                '<div class="tool ">' +
                '  <label>' +
                '    <input type="checkbox" />' +
                '    <span></span>' +
                '  </label>' +
                '</div>',
            checkboxLabel:
                '<div class="columns_title_label">' +
                '  <label>' +
                '    <input type="checkbox" />' +
                '    <span></span>' +
                '  </label>' +
                '</div>',
            radioToolOption:
                '<div class="tool ">' +
                '  <label>' +
                '    <input type="radio" />' +
                '    <span></span>' +
                '  </label>' +
                '</div>',
            title:
                '<div class="analyse_title_cont analyse_settings_cont">' +
                '  <input class="settings_buffer_field" type="text" />' +
                '  <select id="oskari_analysis_analyse_view_start_analyse_settings_buffer_units" class="settings_buffer_units"></select>' +
                '</div>',
            title_name:
                '<div class="analyse_title_name analyse_settings_cont">' +
                '  <input class="settings_name_field" type="text" />' +
                '</div>',
            title_columns:
                '<div class="analyse_title_columns analyse_output_cont">' +
                '  <div class="columns_title_label"></div>' +
                '</div>',
            title_extra:
                '<div class="analyse_title_extra analyse_output_cont">' +
                '  <div class="extra_title_label"></div>' +
                '</div>',
            icon_colors: '<div class="icon-menu"></div>',
            featurePropertySelectButton:
                '<div class="analyse-select-featurelist">' +
                '  <a href="#">...</a>' +
                '</div>',
            featurePropertyList:
                '<div class="analyse-featurelist">' +
                '  <ul></ul>' +
                '</div>',
            featurePropertyListItem:
                '<li>' +
                '  <label>' +
                '    <input type="checkbox" />' +
                '    <span></span>' +
                '  </label>' +
                '</li>',
            featurePropertyRadioButton:
                '<li>' +
                '  <label>' +
                '    <input type="radio" />' +
                '    <span></span>' +
                '  </label>' +
                '</li>',
            areasAndSectorsExtra:
                '<div class="analyse_areas_and_sectors_cont analyse_settings_cont">' +
                '  <label>' +
                '    <div></div>' +
                '    <input class="settings_area_size_field" type="text" pattern="[0-9]+" />' +
                '  </label>' +
                '  <select class="settings_area_size_units"></select>' +
                '  <label>' +
                '    <div></div>' +
                '    <input class="settings_area_count_field" type="text" pattern="[0-9]+" />' +
                '  </label>' +
                '  <label>' +
                '    <div></div>' +
                '    <input class="settings_sector_count_field" type="text" pattern="^0*[1-9]$|^0*1[0-2]$" />' +
                '  </label>' +
                '</div>',
            difference: '<div class="analyse_difference_cont"></div>',
            footer: '<div class="analyse_param_footer"></div>',
            wrapper: '<div class="analyse-result-popup-content"></div>',
            analysisAdditionalInfo: '<div class="analysis_additional_info"></div>'
        },

        /**
         * @method render
         * Renders view to given DOM element
         *
         * @param {jQuery} container
         * reference to DOM element this component will be rendered to
         *
         */
        render: function (container) {
            var me = this,
                content = me.template.main.clone();

            me.mainPanel = content;
            content.find('div.header h3').append(me.loc.title);

            // prepend makes the sidebar go on the left side of the map
            // we could use getNavigationDimensions() and check placement from it to append OR prepend,
            // but it does work with the navigation even on the right hand side being hidden,
            //  a new panel appearing on the left hand side and the map moves accordingly
            container.prepend(content);
            var contentDiv = content.find('div.content');

            me.alert.insertTo(contentDiv);

            var accordion = Oskari.clazz.create(
                'Oskari.userinterface.component.Accordion'
            );
            me.accordion = accordion;

            var contentPanel = Oskari.clazz.create(
                'Oskari.analysis.bundle.analyse.view.ContentPanel',
                me
            );
            me.contentPanel = contentPanel;

            var methodPanel = me._createMethodPanel(),
                settingsPanel = me._createSettingsPanel(),
                outputPanel = me._createOutputPanel();
            contentPanel.getDataPanel().open();
            contentPanel.getDrawToolsPanel().open();
            methodPanel.open();
            settingsPanel.open();
            accordion.addPanel(contentPanel.getDataPanel());
            accordion.addPanel(contentPanel.getDrawToolsPanel());
            accordion.addPanel(methodPanel);
            accordion.addPanel(settingsPanel);
            accordion.addPanel(outputPanel);
            accordion.getContainer().find('.header-icon-info').on('click',
                function (evt) {
                    evt.preventDefault();
                    return false;
                }
            );
            accordion.insertTo(contentDiv);

            // buttons
            // close
            container.find('div.header div.icon-close').on(
                'click',
                function () {
                    me.instance.disableAnalyseMode();
                }
            );
            contentDiv.append(me.template.analysisAdditionalInfo.clone());
            contentDiv.append(me._getButtons());

            var inputs = me.mainPanel.find('input[type=text]');
            inputs.on('focus', function () {
                me.instance.sandbox.postRequestByName(
                    'DisableMapKeyboardMovementRequest'
                );
            });
            inputs.on('blur', function () {
                me.instance.sandbox.postRequestByName(
                    'EnableMapKeyboardMovementRequest'
                );
            });
            // bind help tags
            var helper = Oskari.clazz.create(
                'Oskari.userinterface.component.UIHelper',
                me.instance.sandbox
            );
            helper.processHelpLinks(
                me.loc.help,
                content,
                me.loc.error.title,
                me.loc.error.nohelp
            );

            me._addAnalyseData(contentPanel);
        },

        /**
         * @method setFilterGeometry
         * Sets the filter geometry
         *
         * @param {Array} geometry, geometry to be used in filtering
         *
         */
        setFilterGeometry: function (geometry) {
            this.filterGeometry = geometry;
        },

        /**
         * @method getFilterGeometry
         * Returns the geometry that should be used for filtering
         *
         */
        getFilterGeometry: function () {
            return this.filterGeometry;
        },
        /**
         * @method setFilterJson
         * Sets the filter JSON object for a given layer.
         *
         * @param {String} layer_id
         * @param {JSON} filterJson
         *
         */
        setFilterJson: function (layer_id, filterJson) {
            this._filterJsons[layer_id] = filterJson;
        },

        /**
         * @method removeFilterJson
         * Removes the filter JSON object for a given layer.
         *
         * @param {String} layer_id
         *
         */
        removeFilterJson: function (layer_id) {
            this._filterJsons[layer_id] = null;
            delete this._filterJsons[layer_id];
        },

        /**
         * @method getFilterJson
         * Returns filter JSON object for a given layer.
         *
         * @param {String} layer_id
         *
         * @return {JSON}
         */
        getFilterJson: function (layer_id) {
            var ret = this._filterJsons[layer_id],
                sandbox = this.instance.getSandbox(),
                layer = sandbox.findMapLayerFromSelectedMapLayers(layer_id);

            if (!ret) {
                // There's no user set values for the filter
                ret = {};
                // This set ret.featureIds
                this._getSelectedFeatureIds(layer, ret);
                // Set selected features only to true if there's a selection  ??
                if (!(ret.featureIds && ret.featureIds.length)) {
                    // Set bbox if there's no selection
                    ret.bbox = this.instance.getSandbox().getMap().getBbox();
                }
                // 'save' the filter settings so they don't live after the user
                // has seen them
                this.setFilterJson(layer_id, ret);
            }
            return ret;
        },
        _layerHasProperties: function (layer) {
            return layer && typeof layer.getPropertyTypes === 'function' && Object.keys(layer.getPropertyTypes()).length;
        },

        _createLabel: function (option, toolContainer, className) {
            // TODO does any option actually have width & height?
            var label = option.label;
            if (option.width && option.height) {
                label =
                    label + ' (' + option.width + ' x ' + option.height + 'px)';
            }
            toolContainer.find('label').attr({
                'class': className
            }).find('span').html(label);
        },

        /**
         * @private @method _createMethodPanel
         * Creates the method selection panel for analyse
         *
         *
         * @return {jQuery} Returns the created panel
         */
        _createMethodPanel: function () {
            var me = this,
                panel = Oskari.clazz.create(
                    'Oskari.userinterface.component.AccordionPanel'
                ),
                i,
                option,
                toolContainer,
                tooltipCont;

            panel.setTitle(this.loc.method.label);
            var contentPanel = panel.getContainer();
            // content
            var closureMagic = function (tool) {
                return function () {
                    var j;
                    // reset previous setting
                    for (j = 0; j < me.methodOptions.length; j += 1) {
                        me.methodOptions[j].selected = false;
                    }
                    tool.selected = true;
                };
            };
            var clickMagic = function (tool) {
                return function () {
                    me._modifyExtraParameters(tool.id);
                };
            };
            for (i = 0; i < this.methodOptions.length; i += 1) {
                option = this.methodOptions[i];
                me.option_id = option.id;
                toolContainer = this.template.radioToolOption.clone();
                toolContainer.find('input').attr('name', 'method');
                me._createLabel(option, toolContainer, 'method_radiolabel');

                if (option.selected) {
                    toolContainer.find('input').prop('checked', true);
                }
                tooltipCont = this.template.help.clone();
                tooltipCont.attr('title', option.tooltip);
                toolContainer.append(tooltipCont);

                contentPanel.append(toolContainer);
                toolContainer.find('input').attr({
                    'value': option.id,
                    'name': 'method',
                    'id': option.id
                });
                toolContainer.find('input').on('change', closureMagic(option));
                toolContainer.find('input').on('click', clickMagic(option));
            }

            return panel;
        },

        /**
         * @private @method _createSettingsPanel
         * Creates a settings panel for analyses
         *
         *
         * @return {jQuery} Returns the created panel
         */
        _createSettingsPanel: function () {
            var me = this,
                panel = Oskari.clazz.create(
                    'Oskari.userinterface.component.AccordionPanel'
                ),
                contentPanel = panel.getContainer();

            panel.setTitle(this.loc.settings.label);

            // Changing part of parameters ( depends on method)
            var extra = this.template.paramsOptionExtra.clone();
            contentPanel.append(extra);
            // buffer is default method
            me._addExtraParameters(contentPanel, me.id_prefix + 'buffer');

            var columnsContainer = this.template.columnsContainer.clone();
            this._createColumnsSelector(columnsContainer, me.loc.params.label);
            contentPanel.append(columnsContainer);

            // Analyse NAME
            var selected_layers = me._selectedLayers(),
                name = '_';

            if (selected_layers[0]) {
                name = selected_layers[0].name.substring(0, 15) + name;
            }

            me._addTitle(contentPanel, me.loc.analyse_name.label, me.loc.analyse_name.labelTooltip);
            var analyseTitle = me.template.title_name.clone();
            analyseTitle.find('.settings_name_field').attr({
                'id': 'oskari_analysis_analyse_view_start_analyse_settings_name_field',
                'value': name,
                'placeholder': me.loc.analyse_name.tooltip
            });
            contentPanel.append(analyseTitle);

            var showFeatureData = me.template.checkboxLabel.clone();
            showFeatureData.find('input').attr({'name': 'showFeatureData', 'id': 'showFeatureDataAfterAnalysis'});
            showFeatureData.find('label span').append(me.loc.showFeatureData);
            contentPanel.append(showFeatureData);

            return panel;
        },

        /**
         * @method _createColumnsSelector
         * Creates the selector to select which attributes should be preserved in the analysis
         * (all, none or select from list).
         *
         * @param {jQuery Object} columnsContainer the dom element the columns selector should be appended to.
         *
         */
        _createColumnsSelector: function (columnsContainer, title) {
            var me = this,
                columnsTitle = me.template.title_columns.clone(),
                tooltipCont = me.template.help.clone(),
                toolContainer;

            columnsTitle.find('.columns_title_label').html(title);
            tooltipCont.attr('title', me.loc.params.labelTooltip);
            tooltipCont.addClass('columns-icon-info');
            columnsTitle.find('.columns_title_label').after(tooltipCont);
            columnsContainer.append(columnsTitle);

            var closureMagic = function (tool) {
                return function () {
                    // reset previous setting
                    me.paramsOptions.forEach(function (option) {
                        option.selected = false;
                    });
                    tool.selected = true;

                    // Show analyse featurepropertieslist if tool is analyse_select
                    columnsContainer.find('.analyse-featurelist').toggle(
                        tool.id === 'oskari_analyse_select'
                    );
                };
            };

            me.paramsOptions.forEach(function (option, i, options) {
                toolContainer = me.template.radioToolOption.clone();
                toolContainer.find('input').attr('name', 'params');
                me._createLabel(option, toolContainer, 'params_radiolabel');

                if (option.selected) {
                    toolContainer.find('input[name=params]').prop('checked', true);
                }

                if (option.id === 'oskari_analyse_select') {
                    me._appendFeaturePropertyList(toolContainer);
                }

                columnsContainer.append(toolContainer);
                toolContainer.find('input[name=params]').attr({
                    'value': option.id,
                    'name': 'params',
                    'id': option.id
                });
                toolContainer.find('input[name=params]').on('change',
                    closureMagic(option)
                );
            });

            // Check that params selection is allowed for the selected layer
            this._checkParamsSelection();
        },

        /**
         * @method _appendFeatureList
         * Creates a list to select fields to include in analyse
         *
         * @param {jQuery object} toolContainer
         *
         */
        _appendFeaturePropertyList: function (toolContainer) {
            const selectButton = this.template.featurePropertySelectButton.clone();
            const listContainer = this.template.featurePropertyList.clone();

            selectButton.append(listContainer);
            toolContainer.append(selectButton);
            listContainer.hide();
            const listElem = listContainer.find('ul')
            listElem.empty();
            this._appendItemsToFeaturePropertyList(listElem);

            selectButton.find('a').on('click', function (e) {
                e.preventDefault();
                listContainer.toggle();
            });
        },

        /**
         * @method _appendFields
         * Appeds the fields from the layer to the feature list
         *
         * @param {jQuery object} listElem
         */
        _appendItemsToFeaturePropertyList: function (listElem) {
            const layer = this._getSelectedMapLayer();
            if (!layer) {
                return;
            }
            // get names from types because labels may be empty
            const types = layer.getPropertyTypes();
            const labels = layer.getPropertyLabels();
            Object.keys(types).forEach( name => {
                    const listItem = this.template.featurePropertyListItem.clone();
                    listItem
                        .find('input')
                        .prop('name', 'analyse-feature-property')
                        .val(name);
                    listItem
                        .find('span')
                        .html(labels[name] || name);
                    listItem.on('change', ()  => this._checkPropertyList(listElem));
                    listElem.append(listItem);
                }
            );
            this._preselectProperties(listElem);
        },
        /**
         * @private @method _preselectProperties
         * Preselects the max number of feature properties permitted
         * (defaults to 10).
         *
         * @param  {jQuery} propertyList
         *
         */
        _preselectProperties: function (propertyList) {
            var me = this,
                maxNumOfFields = me.max_analyse_layer_fields,
                method = me._getSelectedMethod();

            if (method === me.id_prefix + 'aggregate') {
                me._preselectPropertiesAggregate(propertyList);
            } else {
                propertyList
                    .find('input[name=analyse-feature-property]')
                    .each(function (index) {
                        if (index < maxNumOfFields) {
                            jQuery(this).prop('checked', true);
                        } else {
                            jQuery(this).prop('disabled', true);
                        }
                    });
            }
        },

        /**
         * @private method _preselectPropertiesAggregate
         * Properties preselection for aggregate method.
         * -By default only select numeric fields.
         * -Add infotext, if text type fields are selected
         */
        _preselectPropertiesAggregate: function (propertyList) {
            var me = this,
                maxNumOfFields = me.max_analyse_layer_fields,
                count = 0;

            propertyList
                .find('input[name=analyse-feature-property]')
                .each(function (index, input) {
                    var field = jQuery(input).val();
                    if (count < maxNumOfFields && me._isNumericField(field)) {
                        jQuery(this).prop('checked', true);
                        count++;
                    } else if (index >= maxNumOfFields) {
                        jQuery(this).prop('disabled', true);
                    }

                    jQuery(input).on('change', function (event) {
                        var checked = propertyList.find('li input:checked'),
                            fieldSelectionInfo = me.mainPanel.find('div.analysis_additional_info'),
                            textFields = false;
                        checked.each(function (index, element) {
                            var field = jQuery(element).val();
                            if (!me._isNumericField(field)) {
                                textFields = true;
                                return false;
                            }
                        });

                        if (checked && checked.length && textFields) {
                            fieldSelectionInfo.html(me.loc.aggregate.aggregateAdditionalInfo);
                        } else {
                            fieldSelectionInfo.html('');
                        }
                    });
                });
        },
        /**
         * @private @method _checkPropertyList
         * Checks if the number of checked properties is over
         * the permitted limit and if so, disables the other
         * properties.
         *
         * @param  {jQuery} propertyList
         *
         */
        _checkPropertyList: function (propertyList) {
            var checked = propertyList.find('li input:checked'),
                unchecked = propertyList.find('li input:not(:checked)');

            if (checked.length >= this.max_analyse_layer_fields) {
                unchecked.prop('disabled', true);
            } else {
                unchecked.prop('disabled', false);
            }
        },

        /**
         * @method _refreshFields
         * Refreshes the fields list after a layer has been added or changed.
         *
         *
         */
        _refreshFields: function () {
            const listElem = this.mainPanel.find('div.analyse-featurelist ul');
            listElem.empty();
            this._appendItemsToFeaturePropertyList(listElem);
        },

        /**
         * @private @method _createOutputPanel
         * Creates a output panel for analyse visualization
         *
         *
         * @return {jQuery} Returns the created panel
         */
        _createOutputPanel: function () {
            const panel = Oskari.clazz.create('Oskari.userinterface.component.AccordionPanel');
            panel.setTitle(this.loc.output.label);

            // tooltip
            const tooltipCont = this.template.help.clone();
            tooltipCont.attr('title', this.loc.output.tooltip);
            tooltipCont.addClass('header-icon-info');
            panel.getHeader().append(tooltipCont);

            const button = Oskari.clazz.create('Oskari.userinterface.component.Button');
            button.setTitle(this.loc.output.editStyle);
            button.setPrimary(true);
            button.setHandler(() => {
                this.openStyleEditor();
            });
            panel.setContent(button.getElement());

            return panel;
        },

        _getLayerByPrefixedId: function (prefixedId, fromSelected) {
            var me = this,
                sandbox = me.instance.getSandbox(),
                layerId = prefixedId ? prefixedId.replace((this.id_prefix + 'layer_'), '') : null,
                ret = null;

            if (layerId !== null && layerId !== undefined) {
                if (fromSelected) {
                    ret = sandbox.findMapLayerFromSelectedMapLayers(layerId);
                } else {
                    ret = sandbox.findMapLayerFromAllAvailable(layerId);
                }
            }
            return ret;
        },

        _getLayerOptions: function (onlySelected, includeSelectData, includeTempData) {
            var me = this,
                options = [],
                option,
                p;

            if (me.contentOptionDivs) {
                for (p in me.contentOptionsMap) {
                    if (me.contentOptionsMap.hasOwnProperty(p)) {
                        if (me.contentOptionDivs[p] !== undefined) {
                            if (!onlySelected || me.contentOptionDivs[p].find('input').prop('checked')) {
                                option = {
                                    id: me.contentOptionsMap[p].id,
                                    label: me.contentOptionsMap[p].label
                                };
                                if (includeSelectData) {
                                    option.data = me.contentOptionDivs[p].find('input').prop('checked');
                                }
                                if (includeTempData) {
                                    option.temp = me.contentOptionsMap[p].temp;
                                }
                                options.push(option);
                            }
                        }
                    }
                }
            }
            return options;
        },

        /**
         * @private @method _selectedLayers
         * Select selected layers for analyse
         *
         *
         * @return {Json ?} Returns selected layers
         */
        _selectedLayers: function () {
            return this._getLayerOptions(true, false, true);
        },
        /**
         * @private @method _getOLGeometry
         * parse JSON geometry to OL geometry
         *
         *@param {JSON} geojson
         * @return {OL geometry} Returns OL geometry - only the 1st one
         */
        _getOLGeometry: function (geojson) {
            if (geojson) {
                return new olFormatGeoJSON().readFeatures(geojson)[0];
            }
            return null;
        },

        /**
         * @private @method _columnSelector
         * Select columns for analyse
         *
         * @param {json}  layers selected layer ids etc
         *
         * @return {Json ?} Returns selected columns
         */
        _columnSelector: function (layers) {
            alert('TODO: add columns selector - use grid component - layers: ' + JSON.stringify(layers));
        },

        /**
         * @method getStyleValues
         * Returns style values as an object
         *
         *
         * @return {Object}
         */
        getStyleValues: function (pick) {
            if (!this._ownStyle) {
                this._ownStyle = this.getRandomizedStyle();
            }
            const style = this._ownStyle;
            if (pick) {
                this._ownStyle = null;
            }
            return style;
        },
        openStyleEditor : function () {
            if (this._popupControls) {
                return;
            }
            const style = this.getStyleValues();
            const onSave = style => {
                this._ownStyle = style;
                this.closeStyleEditor();
            };
            const getRandom = () => this.getRandomizedStyle();
            const onClose = () => this.closeStyleEditor();
            this._popupControls = showStyleEditor(style, getRandom, onSave, onClose)
        },
        closeStyleEditor: function () {
            if (this._popupControls) {
                this._popupControls.close();
            }
            this._popupControls = null;
        },
        getRandomizedStyle: function () {
            const index = Math.floor(Math.random() * (COLORS.length - 1))
            const color = COLORS[index];
            const style = {
                fill: { color: FILL_COLORS[index] },
                image : { fill: { color } },
                stroke: {
                    color,
                    area : { color }
                }
            };
            return jQuery.extend(true, {}, DEFAULT_STYLE, style)
        },

        /**
         * @private @method _getButtons
         * Renders data buttons to DOM snippet and returns it.
         *
         *
         * @return {jQuery} container with buttons
         */
        _getButtons: function () {
            var me = this,
                buttonCont = this.template.buttons.clone(),
                analyseBtn = Oskari.clazz.create(
                    'Oskari.userinterface.component.Button'
                ),
                closeBtn = Oskari.clazz.create(
                    'Oskari.userinterface.component.buttons.ExitButton'
                );

            closeBtn.setHandler(function () {
                me.instance.disableAnalyseMode();
            });
            closeBtn.setId(
                'oskari_analysis_analyse_view_start_analyse_buttons_cancel'
            );
            closeBtn.insertTo(buttonCont);

            analyseBtn.setTitle(this.loc.buttons.analyse);
            analyseBtn.addClass('primary');
            analyseBtn.setHandler(function () {
                // Check parameters and continue to analyse action
                me._analyseMap();
            });
            analyseBtn.setId(
                'oskari_analysis_analyse_view_start_analyse_buttons_analyse'
            );
            analyseBtn.insertTo(buttonCont);

            return buttonCont;
        },

        /**
         * @private @method _addAnalyseData
         * Add analyse data layer to selection box
         *
         * @param {jQuery} contentPanel      content panel for data layer selections
         * @param String   inserted_layer_id id of last inserted layer
         *
         */
        _addAnalyseData: function (contentPanel, inserted_layer_id) {
            var me = this,
                layersContainer = contentPanel.getLayersContainer(),
                sandbox = me.instance.getSandbox(),
                layers = sandbox.findAllSelectedMapLayers(),
                selectedLayer = me._getSelectedMapLayer(),
                selectedLayerAvailable,
                templateOpt = me.template.option,
                templateIcons = me.template.icons_layer,
                templateTempIcons = me.template.icons_temp_layer,
                contentOptions,
                contentOptionsMap,
                contentOptionDivs;
            this.features = contentPanel.getFeatures();
            layers = layers.concat(this.features);
            // Add property types for WFS layer, if not there
            me._addPropertyTypes(layers);
            contentOptions = _.chain(layers)
                .filter(function (layer) {
                    return me._eligibleForAnalyse(layer);
                })
                .map(function (layer) {
                    const layerId = layer.getId();
                    const isTemp = layer.isLayerOfType(me.contentPanel.getLayerType());
                    const hasSelections = me.instance.getSelectionsForLayer(layerId).length > 0;
                    const option = {
                            id: isTemp ? layerId : me.id_prefix + 'layer_' + layerId,
                            layerId,
                            label: layer.getName(),
                            temp: isTemp,
                            icon: layer.getLayerType()
                        };
                    if (isTemp) {
                        delete option.layerId;
                    }

                    // selections exist on some maplayer -> check that one. Otherwise use either the one that was selected before or the one that was added last
                    if (hasSelections) {
                        option.checked = 'checked';
                    } else {
                        if (inserted_layer_id && inserted_layer_id === layerId) {
                            option.checked = 'checked';
                        } else if (!inserted_layer_id && selectedLayer && selectedLayer.getName() === layer.getName()) {
                            option.checked = 'checked';
                        }
                    }

                    return option;
                })
                .value();

            // Check if selected layer is currently available
            if (selectedLayer) {
                selectedLayerAvailable = layers.some(function (layer) {
                    return layer.getId() === selectedLayer.getId();
                });
                if (!selectedLayerAvailable) {
                    selectedLayer = null;
                }
            }
            if (!selectedLayer && contentOptions.length) {
                var checkedOptionsFound = _.find(contentOptions, {'checked': 'checked'});
                if (!checkedOptionsFound) {
                    _.first(contentOptions).checked = 'checked';
                }
            }

            me._determineAnalysisWFSLayer(contentOptions);

            contentOptionsMap = _.foldl(contentOptions, function (map, option) {
                map[option.id] = option;
                return map;
            }, {});
            contentOptionDivs = _.foldl(contentOptions, function (divs, datum) {
                var opt = templateOpt.clone(),
                    isTemp = datum.temp,
                    icons = (isTemp ? templateTempIcons.clone() : templateIcons.clone()),
                    removeLayer;

                opt.find('input')
                    .attr('id', datum.id)
                    .prop('checked', datum.checked)
                    .on('change', function (e) {
                        var selectedlayer = me._getSelectedMapLayer();
                        me._refreshFields();
                        me._modifyAnalyseName();
                        me.showInfos();
                        me._checkParamsSelection();
                        me._checkMethodSelection();
                        me._refreshIntersectLayers();
                        me.refreshExtraParameters();

                        // set the selected layer to be used by selection tools
                        if (selectedlayer && selectedlayer.hasFeatureData()) {
                            me.WFSLayerService.setAnalysisWFSLayerId(selectedlayer.getId());
                        } else {
                            // templayer or sumpin -> just set analysis layer null. Also, disable selection tools.
                            me.WFSLayerService.setAnalysisWFSLayerId(null);
                        }

                        me.contentPanel.toggleSelectionTools();
                    });

                opt.find('label')
                    .attr({
                        'class': 'params_checklabel'
                    })
                    .find('span')
                    .attr('title', datum.label)
                    .html(datum.label);

                if (isTemp) {
                    removeLayer = function (id) {
                        return function () {
                            contentPanel.removeGeometry(id);
                        };
                    };

                    icons.addClass('analyse-temp-feature');
                    icons.on('click', removeLayer(datum.id));
                } else {
                    removeLayer = function (id) {
                        return function () {
                            me._removeLayerRequest(id);
                        };
                    };

                    me._infoRequest(icons, datum.id);
                    me._filterRequest(icons, datum.id);

                    me.updateFilterIcon(datum.layerId, icons);

                    icons.find('div.icon-close').on('click', removeLayer(datum.id));
                    icons.find('.layer-icon').addClass('layer-' + datum.icon);
                }

                opt.append(icons);

                divs[datum.id] = opt;
                return divs;
            }, {});
            _.each(contentOptionDivs, function (div) {
                layersContainer.append(div);
            });

            this.contentOptions = contentOptions;
            this.contentOptionsMap = contentOptionsMap;
            this.contentOptionDivs = contentOptionDivs;

            // Refresh analyse name
            me._modifyAnalyseName();
            me._refreshFields();
            me.refreshExtraParameters();
            me._checkParamsSelection();
            me._checkMethodSelection();
            // Show the possible warnings for selected layer.
            me.showInfos();
        },
        /**
         * @private @method _determineAnalysisWFSLayer
         * Add analyse data layer to selection box
         *
         */
        _determineAnalysisWFSLayer: function (contentOptions) {
            var me = this,
                option;

            me.WFSLayerService.setAnalysisWFSLayerId(null);

            // option checked and is a WFS layer -> set this layer to be used for selections in analysis...
            option = _.find(contentOptions, {checked: 'checked'}, 'layerId');
            if (option && option.layerId) {
                var layer = me.instance.sandbox.findMapLayerFromSelectedMapLayers(option.layerId);
                if (layer && (layer.isLayerOfType('WFS') || layer.isLayerOfType('analysis'))) {
                    me.WFSLayerService.setAnalysisWFSLayerId(layer.getId());
                }
            }
            me.contentPanel.toggleSelectionTools();

            if (!me.contentPanel.getSelectedGeometry()) {
                me.setContentPanelSelectedGeometry();
                me.contentPanel._operateDrawFilters();
            }
        },
        /**
         * @method setContentPanelSelectedGeometry
         * If no selected geometry found ->
         * Check if there are selections made prior to entering the analysis and fetch those from WFSLayerService. Return the first selected feature's geometry, if a selection exists.
         * Otherwise returns null.
         *
         * @return {OpenLayers.Feature.Vector} or null
         */
        setContentPanelSelectedGeometry: function () {
            var me = this,
                analysisWFSLayerId = me.WFSLayerService.getAnalysisWFSLayerId(),
                analysisWFSLayer,
                selectedGeometry = null,
                feature = null;

            if (analysisWFSLayerId) {
                analysisWFSLayer = me.instance.getSandbox().findMapLayerFromSelectedMapLayers(analysisWFSLayerId);
                if (analysisWFSLayer && analysisWFSLayer.getClickedGeometries && analysisWFSLayer.getClickedGeometries().length > 0) {
                    // set filter geometry for filter json
                    var geometries = [];
                    _.forEach(analysisWFSLayer.getClickedGeometries(), function (feature) {
                        geometries.push(feature[1]);
                        me.setFilterGeometry(geometries);
                    });
                    selectedGeometry = analysisWFSLayer.getClickedGeometries()[0];
                }
            }

            if (selectedGeometry) {
                feature = me.contentPanel.parseFeatureFromClickedFeature(selectedGeometry);
            }

            me.contentPanel.selectedGeometry = feature;
        },
        updateFilterIcon: function (layerId, element) {
            var me = this,
                filter,
                filterIcon,
                icons = element,
                added = 'icon-funnel-active',
                removed = 'icon-funnel',
                tmp;

            // See if user has opened the filter popup
            if (me._userSetFilter[layerId]) {
                // See if layer has no active filter
                filter = me.getFilterJson(layerId);
                if (!filter.featureIds && !filter.bbox && !filter.filters) {
                    // Flip classes
                    tmp = added;
                    added = removed;
                    removed = tmp;
                }
                if (!icons || !icons.length) {
                    icons = me.contentPanel.getLayersContainer()
                        .find('#' + me.id_prefix + 'layer_' + layerId)
                        .siblings('.layer-icons');
                }
                filterIcon = icons.find('.filter');
                filterIcon
                    .removeClass(removed)
                    .addClass(added);
            }
        },

        _eligibleForAnalyse: function (layer) {
            if (layer.isLayerOfType(this.contentPanel.getLayerType())) {
                return true;
            }
            return layer.hasFeatureData() && !this.instance.wfsLayerHasUnsupportedVersion(layer);
        },


        /**
         * @private @method _addExtraParameters
         * Add parameters data UI according to method
         *
         * @param {String} prefixedMethod analyse method
         *
         */
        _addExtraParameters: function (contentPanel, prefixedMethod) {
            var me = this,
                extra = contentPanel.find('.extra_params'),
                prefix = me.id_prefix,
                method;

            if (prefixedMethod.indexOf(prefix) !== 0) {
                // We only handle methods that start with the prefix, so we
                // might as well return here if prefix isn't there...
                me.instance.getSandbox().printWarn(
                    'StartAnalyse._addExtraParameters(): unprefixed method:',
                    prefixedMethod
                );
                return;
            }

            method = prefixedMethod.substring(prefix.length);
            if (me.extraParamBuilders[method]) {
                me.extraParamBuilders[method].call(me, me, extra);
            }
        },

        /**
         * @method _addTitle
         * @private
         * Add a title to the given container
         * @param {jQuery} contentPanel div to append extra params
         * @param {String} label        Label string
         */
        _addTitle: function (contentPanel, label, labelTooltip) {
            var title = this.template.title_extra.clone(),
                tooltipCont = this.template.help.clone();
            title.find('.extra_title_label').html(label);
            if (labelTooltip) {
                tooltipCont.attr('title', labelTooltip);
                tooltipCont.addClass('params-icon-info');
                title.find('.extra_title_label').after(tooltipCont);
            }
            contentPanel.append(title);
        },

        /**
         * These add extra parameters to the UI
         */
        extraParamBuilders: {
            /**
             * @private @method buffer
             * Add extra parameters for params UI according to method buffer
             *
             * @param {jQuery} contentPanel  div to append extra params
             *
             */
            buffer: function (me, contentPanel) {
                var bufferOptions = me.template.title.clone(),
                    bufferUnitSelect = bufferOptions.find(
                        'select.settings_buffer_units'
                    ),
                    unit;

                this._addTitle(contentPanel, me.loc.buffer_size.label, this.loc.buffer_size.labelTooltip);
                bufferOptions.find('.settings_buffer_field').attr({
                    'id': 'oskari_analysis_analyse_view_start_analyse_settings_buffer_field',
                    'value': '',
                    'placeholder': me.loc.buffer_size.tooltip
                });
                for (unit in me.bufferUnits) {
                    if (me.bufferUnits.hasOwnProperty(unit)) {
                        bufferUnitSelect.append(
                            '<option value="' + unit + '">' +
                            me.loc.buffer_units[unit] +
                            '</option>'
                        );
                    }
                }

                contentPanel.append(bufferOptions);

                contentPanel.parent().find('input[name=showFeatureData]').prop('checked', false);
            },

            /**
             * @method aggregate
             * @private
             ** Add extra parameters for params UI according to method aggregate
             * @param {jQuery} contentPanel  div to append extra params
             */
            aggregate: function (me, contentPanel) {
                var toolContainer;
                // Title
                me._addTitle(contentPanel, me.loc.aggregate.label, me.loc.aggregate.labelTooltip);

                // sum, count, min, max, med
                var closureMagic = function (tool) {
                    return function () {
                        me.aggreOptions.forEach(function (option) {
                            option.selected = false;
                        });
                        tool.selected = true;
                    };
                };

                me.aggreOptions.forEach(function (option, i, options) {
                    toolContainer = me.template.checkboxToolOptíon.clone();
                    toolContainer.find('input').attr('name', 'aggre');
                    me._createLabel(option, toolContainer, 'params_radiolabel');

                    toolContainer.find('input').prop('checked', true);

                    contentPanel.append(toolContainer);
                    toolContainer.find('input').attr({
                        'value': option.id,
                        'name': 'aggre',
                        'id': option.id
                    });
                    toolContainer.find('input').on('change', closureMagic(option));

                    // Disable no data, if no no data
                    if (option.id === 'oskari_analyse_NoDataCnt') {
                        if (me._getNoDataValue()) {
                            toolContainer.find('input').prop('disabled', false);
                            toolContainer.find('input').prop('checked', true);
                        } else {
                            toolContainer.find('input').prop('checked', false);
                            toolContainer.find('input').prop('disabled', true);
                        }
                    }
                });

                var showDataInput = contentPanel.parent().find('#showFeatureDataAfterAnalysis');
                showDataInput.prop('checked', true);

                var showValuesCheckbox = me.template.checkboxLabel.clone();
                showValuesCheckbox.addClass('show_data_in_popup');
                showValuesCheckbox.find('input').attr('id', 'showFeatureDataWithoutSaving');
                showValuesCheckbox.find('label span').append(me.loc.showValuesCheckbox);
                contentPanel.parent().append(showValuesCheckbox);

                showValuesCheckbox.find('input').on('change', function () {
                    if (showValuesCheckbox.find('input')[0].checked) {
                        showDataInput.prop({'checked': false, 'disabled': true});
                    } else {
                        showDataInput.prop('disabled', false);
                    }
                });

                contentPanel.parent().find('input[name=showFeatureData]').prop('checked', true);

                if (me._getNoDataValue()) {
                    toolContainer.append(me._param_footer);
                }
            },

            aggregateNumeric: function (me, contentPanel) {
                return me.extraParamBuilders.aggregate(contentPanel);
            },

            /**
             * @private @method aggregateText
             * Add extra parameters for params UI according to method aggregate
             *
             * @param {jQuery} contentPanel  div to append extra params
             *
             */
            aggregateText: function (me, contentPanel) {
                var text_parm_len = 1,
                    i,
                    option,
                    toolContainer;

                // Title
                me._addTitle(contentPanel, me.loc.aggregate.label, me.loc.aggregate.labelTooltip);

                // sum, count, min, max, med
                var closureMagic = function (tool) {
                    return function () {
                        var j;
                        // reset previous setting
                        for (j = 0; j < text_parm_len; j += 1) {
                            me.aggreOptions[j].selected = false;
                        }
                        tool.selected = true;
                    };
                };

                for (i = 0; i < text_parm_len; i += 1) {
                    option = me.aggreOptions[i];
                    toolContainer = me.template.checkboxToolOptíon.clone();
                    toolContainer.find('input').attr('name', 'aggre');
                    me._createLabel(option, toolContainer, 'params_radiolabel');

                    toolContainer.find('input').prop('checked', true);

                    contentPanel.append(toolContainer);
                    toolContainer.find('input').attr({
                        'value': option.id,
                        'name': 'aggre',
                        'id': option.id
                    });
                    toolContainer.find('input').on('change', closureMagic(option));
                }
            },

            union: function (me, contentPanel) {
                contentPanel.parent().find('input[name=showFeatureData]').prop('checked', false);
            },

            clip: function (me, contentPanel) {
                contentPanel.parent().find('input[name=showFeatureData]').prop('checked', false);
                return me.extraParamBuilders.intersect(me, contentPanel, false);
            },

            /**
             * @private @method _intersectExtra
             * Add extra parameters for params UI according to method needs
             *
             * @param {jQuery} contentPanel  div to append extra params
             * @param {boolean} full define if full or limited set of choices is shown
             *
             */
            intersect: function (me, contentPanel, full) {
                // Set radiobuttons for selecting intersecting layer
                var options = me._getLayerOptions(false, true, false),
                    optionChecked,
                    targetLayer = _.find(options, {
                        'data': true
                    }),
                    targetLayerElem = jQuery('<span></span>'),
                    toolContainer,
                    input,
                    label,
                    showSpatial = full !== undefined ? full : true; // Show also spatial operator choice

                me.intersectOptions = options;
                me.intersectOptionsMap = {};

                options.forEach(function (option) {
                    me.intersectOptionsMap[option.id] = option;
                });

                if (showSpatial) {
                    me._addTitle(contentPanel, me.loc.spatial.target, me.loc.spatial.targetTooltip);
                    targetLayerElem.html((targetLayer ? targetLayer.label : ''));
                    contentPanel.append(targetLayerElem);
                    me._addTitle(contentPanel, me.loc.spatial.intersectingLayer, me.loc.spatial.intersectingLayerTooltip);
                    contentPanel.parent().find('input[name=showFeatureData]').prop('checked', true);
                } else {
                    me._addTitle(contentPanel, me.loc.intersect.target, me.loc.intersect.targetLabelTooltip);
                    targetLayerElem.html((targetLayer ? targetLayer.label : ''));
                    contentPanel.append(targetLayerElem);
                    me._addTitle(contentPanel, me.loc.intersect.label, me.loc.intersect.labelTooltip);
                }

                var closureMagic = function (tool) {
                    return function () {
                        me.intersectOptions.forEach(function (option) {
                            option.selected = false;
                        });
                        tool.selected = true;
                    };
                };

                options.forEach(function (option, i, options) {
                    optionChecked = (i === 0 ? 'checked' : undefined);
                    toolContainer = me.template.radioToolOption.clone();
                    toolContainer.find('input').attr('name', 'intersect');
                    input = toolContainer.find('input');
                    label = option.label;
                    toolContainer.find('label').append(label).attr({
                        'for': 'intersect_' + option.id,
                        'class': 'params_radiolabel'
                    });
                    // Preselect option if there's only 2 in total (one of them will be hidden below)
                    // Do not show option if it is selected as analysis data
                    option.selected = options.length === 2 && !option.data;

                    if (option.data) {
                        toolContainer.hide();
                    }

                    if (option.selected) {
                        input.prop('checked', true);
                    }
                    contentPanel.append(toolContainer);
                    input.attr({
                        'value': option.id,
                        'name': 'intersect',
                        'id': 'intersect_' + option.id
                    }).prop('checked', optionChecked);
                    input.on('change', closureMagic(option));
                });

                // Show spatial operator choice
                if (showSpatial) {
                    // title spatial operator
                    me._addTitle(contentPanel, me.loc.spatial.label, me.loc.spatial.labelTooltipIntersect);

                    var selectSpatial = function (tool) {
                        return function () {
                            me.spatialOptions.forEach(function (option) {
                                option.selected = false;
                            });
                            tool.selected = true;
                        };
                    };

                    // spatial operators
                    me.spatialOptions.forEach(function (option, i, options) {
                        toolContainer = me.template.radioToolOption.clone();
                        toolContainer.find('input').attr('name', 'spatial');
                        me._createLabel(
                            option,
                            toolContainer,
                            'params_radiolabel'
                        );

                        toolContainer.find('input').prop('checked', !!option.selected);
                        contentPanel.append(toolContainer);
                        toolContainer.find('input').attr({
                            'value': option.id,
                            'name': 'spatial',
                            'id': option.id
                        });
                        toolContainer.find('input').on('change',
                            selectSpatial(option)
                        );
                    });
                }
            },

            /**
             * @method layer_union
             * Add layer selection ui for analyse layer union.
             *
             * @param  {jQuery} contentPanel
             *
             * @return {undefined}
             */
            layer_union: function (me, contentPanel) {
                var selectedLayer = me._getSelectedMapLayer(),
                    i,
                    option,
                    toolContainer,
                    label;

                me = this;

                if (!selectedLayer || (selectedLayer && !selectedLayer.isLayerOfType('ANALYSIS'))) {
                    contentPanel.append(jQuery(
                        '<div>' + me.loc.layer_union.notAnalyseLayer + '</div>'
                    ));
                    return;
                }

                me.unionOptions = jQuery.map(
                    me.contentOptionsMap || {},
                    function (val, key) {
                        if (me._validForLayerUnion(selectedLayer, val.id)) {
                            return {
                                id: val.id,
                                label: val.label
                            };
                        }
                    }
                );

                if (me.unionOptions.length === 0) {
                    contentPanel.append(jQuery(
                        '<div>' + me.loc.layer_union.noLayersAvailable + '</div>'
                    ));
                    return;
                }

                me._addTitle(contentPanel, me.loc.layer_union.label, this.loc.layer_union.labelTooltip);

                // layers
                for (i = 0; i < me.unionOptions.length; i += 1) {
                    option = me.unionOptions[i];
                    toolContainer = me.template.checkboxToolOptíon.clone();
                    toolContainer.find('input').attr('name', 'layer_union');
                    label = option.label;
                    toolContainer.find('label').append(label).attr({
                        'class': 'params_checklabel'
                    });
                    toolContainer.find('input').prop('checked', !!option.selected);
                    contentPanel.append(toolContainer);
                    toolContainer.find('input').attr({
                        'value': option.id,
                        'id': option.id
                    });
                }

                contentPanel.parent().find('input[name=showFeatureData]').prop('checked', false);
            },

            /**
             * @method areas_and_sectors
             * Add params ui for areas and sectors.
             *
             * @param  {jQuery} contentPanel
             *
             * @return {undefined}
             */
            areas_and_sectors: function (me, contentPanel) {
                var loc = me.loc.areas_and_sectors,
                    extraParams = me.template.areasAndSectorsExtra.clone(),
                    unitsSelect = extraParams.find('.settings_area_size_units'),
                    unit,
                    labels = extraParams.find('label'),
                    keys = ['area_size', 'area_count', 'sector_count'];

                this._addTitle(contentPanel, loc.label, loc.labelTooltip);
                for (unit in me.bufferUnits) {
                    if (me.bufferUnits.hasOwnProperty(unit)) {
                        unitsSelect.append(
                            '<option value="' + unit + '">' +
                            me.loc.buffer_units[unit] +
                            '</option>'
                        );
                    }
                }

                labels.each(function (i) {
                    this.getElementsByTagName('DIV')[0].innerHTML = loc[keys[i]];
                    this.getElementsByTagName('INPUT')[0].placeholder =
                        loc[keys[i] + '_tooltip'];
                });

                contentPanel.append(extraParams);

                contentPanel.parent().find('input[name=showFeatureData]').prop('checked', true);
            },

            /**
             * @method _diffExtra
             * Add params ui for difference.
             *
             * @param  {jQuery} contentPanel
             *
             * @return {undefined}
             */
            difference: function (me, contentPanel) {
                var loc = me.loc.difference,
                    extraParams = me.template.difference.clone(),
                    featureList,
                    firstField,
                    options = me._getLayerOptions(false, true, false),
                    option,
                    targetLayerOption = _.find(options, {
                        'data': true
                    }),
                    targetLayer = targetLayerOption ? me._getLayerByPrefixedId(targetLayerOption.id, true) : null,
                    toolContainer,
                    i,
                    j;

                me.differenceOptions = options;
                me.differenceLayer = null;
                // First layer is selected outside this panel, so no selection to be done here
                me._addTitle(extraParams, loc.firstLayer, loc.firstLayerTooltip);
                extraParams.append(jQuery('<span></span>').html((targetLayerOption ? targetLayerOption.label : '')));

                // Field for first layer, it's well possible that the layer doesn't have any...
                // TODO select matching field in second layer if possible (and if there's no user selection)
                me._addTitle(extraParams, loc.field, loc.firstLayerFieldTooltip);
                if (me._layerHasProperties(targetLayer)) {
                    featureList = me.template.featurePropertyList.clone();
                    featureList.attr('id', 'analyse-layer1-field');
                    firstField = me._addFeaturePropertyList(
                        targetLayer,
                        featureList.find('ul'),
                        'analyse-layer1-field-property'
                    );
                    extraParams.append(featureList);
                }

                // Second layer selection
                me._addTitle(extraParams, loc.secondLayer, loc.secondLayerTooltip);

                var closureMagic = function (tool) {
                    return function () {
                        var k;
                        // reset previous setting
                        for (k = 0; k < me.differenceOptions.length; k += 1) {
                            me.differenceOptions[k].selected = false;
                        }
                        tool.selected = true;
                        me._addFeatureList(
                            me._getLayerByPrefixedId(tool.id),
                            jQuery('#analyse-layer2-field').find('ul'),
                            'analyse-layer2-field-property'
                        );
                        me.differenceLayer = me._getLayerByPrefixedId(tool.id);
                        // Update the key list
                        jQuery('div.analyse-featurelist#analyse-key-field').replaceWith(me._createJoinList(me._getSelectedMapLayer()));
                    };
                };
                for (i = 0, j = me.differenceOptions.length; i < j; i += 1) {
                    option = me.differenceOptions[i];
                    toolContainer = me.template.radioToolOption.clone();
                    toolContainer.find('input').attr('name', 'difference');
                    toolContainer.find('label span').append(option.label);

                    // Select option if there's only 2 to select from (the other one will be unselected below)
                    if (j === 2) {
                        option.selected = true;
                    }

                    // Do not show option if it is selected as analysis data
                    if (option.data) {
                        toolContainer.hide();
                        option.selected = false;
                    }

                    extraParams.append(toolContainer);

                    if (option.selected) {
                        me.differenceLayer = me._getLayerByPrefixedId(option.id);
                    }
                    toolContainer.find('input').attr({
                        'value': option.id,
                        'name': 'differenceLayer',
                        'id': 'difference_' + option.id
                    })
                        .prop('checked', !!option.selected)
                        .on('change', closureMagic(option));
                }

                // Second layer field selection
                me._addTitle(extraParams, loc.field, loc.secondLayerFieldTooltip);
                featureList = me.template.featurePropertyList.clone();
                featureList.attr('id', 'analyse-layer2-field');
                if (me._layerHasProperties(me.differenceLayer)) {
                    me._addFeaturePropertyList(
                        me.differenceLayer,
                        featureList.find('ul'),
                        'analyse-layer2-field-property',
                        firstField
                    );
                }
                extraParams.append(featureList);

                me._addTitle(extraParams, loc.keyField, loc.keyFieldTooltip);
                extraParams.append(me._createJoinList(targetLayer));

                contentPanel.append(extraParams);

                contentPanel.parent().find('input[name=showFeatureData]').prop('checked', true);
            },

            /**
             * @method spatial_join
             * Add layer selection ui for analyse spatial join.
             *
             * @param  {jQuery} contentPanel
             *
             * @return {undefined}
             */
            spatial_join: function (me, contentPanel) {
                // - Second layer selection
                // - Option selection for both layers
                //   - combined max 10 options
                var loc = me.loc.spatial_join,
                    extraParams = me.template.difference.clone(),
                    featureList,
                    options = me._getLayerOptions(false, true, false),
                    option,
                    targetLayerOption = _.find(options, {
                        'data': true
                    }),
                    targetLayer = targetLayerOption ? me._getLayerByPrefixedId(targetLayerOption.id, true) : null,
                    toolContainer,
                    i,
                    j,
                    showSpatial = true, // Show also spatial operator choice

                    limitSelection = function (autoSelect) {
                        var features = extraParams.find(
                                '.analyse-featurelist ul li input'
                            ),
                            selectedFeatures = features.filter(
                                ':checked'
                            ).length;

                        if (autoSelect && selectedFeatures < 10) {
                            // Some selections can still be made...
                            var newSelections = features
                                .filter(':not(:checked)')
                                .slice(0, 10 - selectedFeatures);

                            selectedFeatures += newSelections.length;
                            newSelections.prop('checked', true);
                        }

                        if (selectedFeatures === 10) {
                            // max amount of features selected, disable the rest
                            features.filter(':not(:checked)').prop('disabled', true);
                        } else {
                            // Features can still be selected
                            features.prop('disabled', false);
                        }
                    };

                me.differenceOptions = options;
                me.differenceLayer = null;

                // spatial join mode: normal/aggregate
                me._addTitle(extraParams, loc.mode, loc.modeTooltip);
                var modeToolContainer = me.template.radioToolOption.clone();
                modeToolContainer.find('input').attr({'name': 'spatial_join_mode', 'value': 'oskari_analyse_normal'}).prop('checked', true);
                modeToolContainer.find('label span').append(loc.normalMode);
                modeToolContainer.on('change', function () {
                    _.forEach(extraParams.find('input[name=analyse-layer1-field-property]'), function (input) {
                        input.setAttribute('type', 'checkbox');
                    });
                    contentPanel.find('#oskari_analyse_intersect')[0].disabled = false;
                });
                extraParams.append(modeToolContainer);

                var modeToolContainer2 = me.template.radioToolOption.clone();
                modeToolContainer2.find('input').attr({'name': 'spatial_join_mode', 'value': 'oskari_analyse_aggregate'});
                modeToolContainer2.find('label span').append(loc.aggregateMode);
                modeToolContainer2.on('change', function () {
                    _.forEach(extraParams.find('input[name=analyse-layer1-field-property]'), function (input) {
                        input.setAttribute('type', 'radio');
                        input.disabled = false;
                    });
                    limitSelection(false);
                    extraParams.find('input[name=analyse-layer1-field-property]')[0].checked = true;
                    contentPanel.find('#oskari_analyse_intersect')[0].disabled = true;
                    contentPanel.find('#oskari_analyse_contains')[0].checked = true;
                });
                extraParams.append(modeToolContainer2);

                // First layer is selected outside this panel, so no selection to be done here
                me._addTitle(extraParams, loc.firstLayer, loc.firstLayerTooltip);
                extraParams.append(
                    jQuery('<span></span>').html(
                        (targetLayerOption ? targetLayerOption.label : '')
                    )
                );

                // Field for first layer, it's well possible that the layer doesn't have any...
                // TODO select matching field in second layer if possible (and if there's no user selection)
                me._addTitle(extraParams, me.loc.params.label, loc.firstLayerFieldTooltip);
                if (me._layerHasProperties(targetLayer)) {
                    featureList = me.template.featurePropertyList.clone();
                    featureList.attr('id', 'analyse-layer1-field');
                    me._addFeaturePropertyList(
                        targetLayer,
                        featureList.find('ul'),
                        'analyse-layer1-field-property',
                        null,
                        true
                    );
                    featureList.find('ul li').on('change', function () {
                        limitSelection(false);
                    });
                    extraParams.append(featureList);
                }

                // Second layer selection
                me._addTitle(extraParams, loc.secondLayer, loc.secondLayerTooltip);

                var closureMagic = function (tool) {
                    return function () {
                        // reset previous setting
                        me.differenceOptions.forEach(function (option) {
                            option.selected = false;
                        });
                        tool.selected = true;
                        var featureList = jQuery('#analyse-layer2-field ul');
                        me._addFeaturePropertyList(
                            me._getLayerByPrefixedId(tool.id),
                            featureList,
                            'analyse-layer2-field-property',
                            null,
                            true
                        );
                        featureList.find('ul li').on('change', function () {
                            limitSelection(false);
                        });
                        limitSelection();
                        me.differenceLayer = me._getLayerByPrefixedId(tool.id);
                    };
                };

                for (i = 0, j = me.differenceOptions.length; i < j; i += 1) {
                    option = me.differenceOptions[i];
                    toolContainer = me.template.radioToolOption.clone();
                    toolContainer.find('input').attr('name', 'difference');
                    toolContainer.find('label span').append(option.label);

                    // Select option if there's only 2 to select from (the other one will be unselected below)
                    if (j === 2) {
                        option.selected = true;
                    }

                    // Do not show option if it is selected as analysis data
                    if (option.data) {
                        toolContainer.hide();
                        option.selected = false;
                    }

                    extraParams.append(toolContainer);

                    if (option.selected) {
                        me.differenceLayer = me._getLayerByPrefixedId(
                            option.id
                        );
                    }
                    toolContainer.find('input').attr({
                        'value': option.id,
                        'name': 'differenceLayer',
                        'id': 'difference_' + option.id
                    })
                        .prop('checked', !!option.selected)
                        .on('change', closureMagic(option));
                }

                // Second layer field selection
                me._addTitle(extraParams, me.loc.params.label, loc.secondLayerFieldTooltip);
                featureList = me.template.featurePropertyList.clone();
                featureList.attr('id', 'analyse-layer2-field');
                if (me._layerHasProperties(me.differenceLayer)) {
                    me._addFeaturePropertyList(
                        me.differenceLayer,
                        featureList.find('ul'),
                        'analyse-layer2-field-property',
                        null,
                        true
                    );
                    featureList.find('ul li').on('change', function () {
                        limitSelection(false);
                    });
                }
                extraParams.append(featureList);
                limitSelection(true);

                contentPanel.append(extraParams);

                if (showSpatial) {
                    // title spatial operator
                    var titlespa = me.template.title_extra.clone();
                    titlespa.find('.extra_title_label').html(
                        me.loc.spatial.label
                    );
                    contentPanel.append(titlespa);

                    var selectSpatial = function (tool) {
                        return function () {
                            me.spatialOptions.forEach(function (option) {
                                option.selected = false;
                            });
                            tool.selected = true;
                        };
                    };

                    // spatial operators
                    me.spatialOptions.forEach(function (option, i, options) {
                        toolContainer = me.template.radioToolOption.clone();
                        toolContainer.find('input').attr('name', 'spatial');
                        me._createLabel(
                            option,
                            toolContainer,
                            'params_radiolabel'
                        );

                        toolContainer.find('input').prop('checked', !!option.selected);
                        contentPanel.append(toolContainer);
                        toolContainer.find('input').attr({
                            'value': option.id,
                            'name': 'spatial',
                            'id': option.id
                        });
                        toolContainer.find('input').on('change',
                            selectSpatial(option)
                        );
                    });
                }

                contentPanel.parent().find('input[name=showFeatureData]').prop('checked', true);
            }
        },

        _createJoinList: function (targetLayer) {
            // Check equal join keys
            const featureList = this.template.featurePropertyList.clone();
            featureList.attr('id', 'analyse-key-field');
            let joinKey;
            if (this.differenceLayer && targetLayer) {
                const { data: diffData = {} } = this.differenceLayer.getAttributes();
                const { data: targetData = {} } = targetLayer.getAttributes();
                if (diffData.commonId === targetData.commonId) {
                    joinKey = diffData.commonId;
                }
            }
            if (joinKey) {
                featureList.find('ul').append(joinKey);
            } else {
                this._addFeaturePropertyList(
                    targetLayer,
                    featureList.find('ul'),
                    'analyse-key-field-property'
                );
            }
            return featureList;
        },

        _addFeaturePropertyList: function (layer, container, elemName, preselectId, multiSelect) {
            const me = this;
            // Make sure the container is empty
            container.empty();
            let firstElement;
            let preselection = false;
            const elementTemplate = multiSelect ? this.template.featurePropertyList : this.template.featurePropertyRadioButton;
            const properties = layer.getPropertyTypes();
            const labels = layer.getPropertyLabels();
            Object.keys(properties).forEach(function (name, idx) {
                const elem = elementTemplate.clone();
                // Store first element so we can check it if there's no preselection found
                if (idx === 0) {
                    firstElement = elem;
                }

                if (!preselection && name === preselectId) {
                    preselection = true;
                }

                elem
                    .find('input')
                    .prop('name', elemName)
                    .prop('checked', preselection && name === preselectId)
                    .val(name);

                elem
                    .find('label span')
                    .html(labels[name] || name);

                if (!multiSelect && !preselection) {
                    firstElement
                        .find('input')
                        .prop('checked', true);
                }

                container.append(elem);
            });
            container.find('input:radio[name="' + name + '"]').on('change', () => {
                var i,
                    j,
                    labels,
                    radios,
                    selIndex,
                    spans,
                    text;
                // Update another radio button group
                for (i = 1; i < 3; i += 1) {
                    j = 2 - (i + 1) % 2;
                    if (jQuery(this).attr('name') === 'analyse-layer' + i + '-field-property') {
                        labels = me.mainPanel.find('input:radio[name="analyse-layer' + j + '-field-property"]').parent();
                        radios = labels.find('input:radio');
                        radios.prop('checked', false);
                        spans = labels.find('span');
                        text = jQuery(this).parent().find('span').text();
                        selIndex = spans.index(labels.find('span:contains("' + text + '")'));
                        jQuery(radios[selIndex]).prop('checked', true);
                    }
                }
            });
            return preselection ? preselectId : firstElement ? firstElement.find('input').val() : null;
        },

        /**
         * @private @method _refreshIntersectLayers
         * Refreshes layer list in the intersect or clip parameters
         *
         *
         */
        _refreshIntersectLayers: function () {
            var dataLayers = jQuery('div.basic_analyse div.analyse_option_cont.analyse_settings_cont input[type=radio]'),
                paramLayer,
                i,
                j;

            // No need to refresh?
            if ((jQuery('div.basic_analyse div.extra_params input[type=radio][name=intersect]')).length === 0) {
                return;
            }

            for (i = 0; i < dataLayers.length; i += 1) {
                paramLayer = jQuery('div.basic_analyse div.extra_params input[type=radio][name=intersect][value=' + jQuery(dataLayers[i]).attr('id') + ']');
                for (j = 0; j < dataLayers.length; j += 1) {
                    if (jQuery(dataLayers[i]).prop('checked')) {
                        paramLayer.prop('checked', false);
                        paramLayer.parent().hide();
                    } else {
                        paramLayer.parent().show();
                    }
                }
            }
        },

        /**
         * @method _validForLayerUnion
         * Checks to see if the layer hiding behind the id is valid for layer union.
         * It performs checks to see if the layer is not the same as the selected layer,
         * the layer is of type 'analysis', and if the layer has the same feature fields
         * as the selected layer.
         *
         * @param  {Oskari.Layer} selectedLayer
         * @param  {String} oskari_analyse_id id of the layer in form 'oskari_analyse_layer_<id>'
         *
         * @return {Boolean} returns true if the layer is valid for analyse union
         */
        _validForLayerUnion: function (selectedLayer, oskari_analyse_id) {
            if (!oskari_analyse_id) {
                return false;
            }
            // do we find the layer?
            var layer = this._getLayerByPrefixedId(oskari_analyse_id, true);
            if (!layer) {
                return false;
            }
            // is it the same layer as the selected layer?
            if (layer.getId() === selectedLayer.getId()) {
                return false;
            }
            // is the layer an analysis layer?
            if (!layer.isLayerOfType('ANALYSIS')) {
                return false;
            }
            // does the layer have the same properties as the selected layer
            const props1 = (this._layerHasProperties(selectedLayer) ? Object.keys(selectedLayer.getPropertyTypes()) : []);
            const props2 = (this._layerHasProperties(layer) ? Object.keys(layer.getPropertyTypes()) : []);

            // arrays are of different lengths
            if (props1.length !== props1.length) {
                return false;
            }
            return props1.every(p => props2.includes(p))
        },

        /**
         * @method _getLayerUnionLayers
         * Returns the analyse layers the user has selected for union.
         * Adds also the selected layer since it's not included in the checkboxes.
         *
         * @param  {jQuery} container
         *
         * @return {Array[String]}
         */
        _getLayerUnionLayers: function (container) {
            var me = this,
                layerUnionLayers = container.find('input[name=layer_union]:checked'),
                selectedLayer = this._getSelectedMapLayer();

            layerUnionLayers = jQuery.map(layerUnionLayers, function (val, i) {
                return val.value.replace((me.id_prefix + 'layer_'), '');
            });

            layerUnionLayers.push(selectedLayer.getId());

            return layerUnionLayers;
        },

        /**
         * @private @method _modifyExtraParameters
         * modify parameters data UI according to method
         *
         * @param {String} method  analyse method
         *
         */
        _modifyExtraParameters: function (method) {
            var me = this,
                prefix = me.id_prefix,
                contentPanel = me.mainPanel.find('div.extra_params');

            // Remove old content
            contentPanel.empty();

            contentPanel.parent().find('#showFeatureDataAfterAnalysis').prop('disabled', false);

            if (contentPanel.parent().find('.show_data_in_popup')) {
                contentPanel.parent().find('.show_data_in_popup').remove();
            }

            // Empty the attribute selector for preserved layer attributes
            // And create it unless the selected method is aggregate,
            // in which case create a dropdown to select an attribute to aggregate
            var columnsContainer = me.mainPanel.find('div.analyse-columns-container');
            if (prefix + 'aggregate' === method) {
                columnsContainer.empty();
                me._createColumnsSelector(columnsContainer, me.loc.params.aggreLabel);
            } else if (prefix + 'aggregateText' === method) {
                // nop
            } else if (prefix + 'aggregateNumeric' === method) {
                // nop
            } else if (prefix + 'difference' === method) {
                // difference doesn't need anything here...
                columnsContainer.empty();
            } else if (prefix + 'spatial_join' === method) {
                // spatial join doesn't need anything here...
                columnsContainer.empty();
            } else {
                columnsContainer.empty();
                me._createColumnsSelector(columnsContainer, me.loc.params.label);
            }

            me._addExtraParameters(contentPanel.parent(), method);
        },

        /**
         * @private @method refreshAnalyseData
         * refresh analyse data layers in selection box
         *
         *
         */
        refreshAnalyseData: function (layer_id) {
            // Remove old
            this.contentPanel.emptyLayers();
            this._addAnalyseData(this.contentPanel, layer_id);
        },

        /**
         * @private @method refreshExtraParameters
         * refresh analyse parameters UI in the selection box
         *
         *
         */
        refreshExtraParameters: function () {
            var me = this,
                selectedMethod = me._getSelectedMethod();
            me._modifyExtraParameters(selectedMethod);
        },

        /**
         * @private @method _getSelectedMethod
         * Convenience method for getting the analysis method currently selected.
         */
        _getSelectedMethod: function () {
            var me = this,
                container = me.mainPanel,
                selectedMethod = container.find('input[name=method]:checked').val();
            return selectedMethod;
        },
        /**
         * @private @method _gatherSelections
         * Gathers analyse selections and returns them as JSON object
         *
         *
         * @return {Object}
         */
        _gatherSelections: function () {
            const layer = this._getSelectedMapLayer();
            // No layers
            if (!layer) {
                return;
            }
            const container = this.mainPanel;
            const selectedMethod = this._getSelectedMethod();
            const method = selectedMethod ? selectedMethod.replace(this.id_prefix, '') : '';

            // Get the feature fields
            var selectedColumnmode = container.find('input[name=params]:checked').val();
            const fieldSelection = selectedColumnmode && selectedColumnmode.replace(this.id_prefix, '');
            const fieldTypes = this._layerHasProperties(layer) ? layer.getPropertyTypes() : {};
            let fields = [];
            // All fields
            if (fieldSelection === 'all') {
                fields = Object.keys(fieldTypes);
            } else if (fieldSelection === 'select') {
                // Selected fields
                var fieldsList = jQuery('div.analyse-featurelist').find('ul li input:checked');
                fields = jQuery.map(fieldsList, function (val) {
                    return val.value;
                });
            }
            // HACK!!
            // There should be one propertety in filter - in other case all properties are retreaved by WPS
            // Userlayer has forced selection for no properties => fields is empty array
            // Add feature_id field (can't use normal fields because them values are inside property_json)
            if (layer.getLayerType() === 'userlayer') {
                fields = ['feature_id'];
            }

            var name = container.find('.settings_name_field').val() ? container.find('.settings_name_field').val() : '_';
            const defaults = {
                    name,
                    fields,
                    fieldTypes,
                    method,
                    layerType: layer.getLayerType()
                };

            if (layer.isLayerOfType(this.contentPanel.getLayerType())) {
                defaults.layerId = -1;
                defaults.features = [layer.getFeature()];
            } else {
                defaults.layerId = layer.getId();
            }
            // Get method specific selections
            var selections = this._getMethodSelections(layer, defaults);

            // Styles
            selections.style = this.getStyleValues(true);
            // Bbox
            selections.bbox = this.instance.getSandbox().getMap().getBbox();

            // Override style - :TODO make UI for this and get override from there
            if (defaults.method === 'difference') {
                selections.override_sld = 'sld_muutos_n1';
            } else if (defaults.method === 'areas_and_sectors') {
                selections.override_sld = 'sld_label_t1';
            }
            return selections;
        },

        /**
         * @private @method _getMethodSelections
         * Adds method specific parameters to selections
         *
         * @param {Object} layer an Oskari layer
         * @param {Object} defaultSelections the defaults, such as name etc.
         *
         * @return {Object} selections for a given method
         */
        _getMethodSelections: function (layer, defaultSelections) {
            var me = this,
                container = this.mainPanel,
                methodName = defaultSelections.method,
                bufferSize = container.find('.settings_buffer_field').val(),
                bufferUnit = container.find('.settings_buffer_units option:selected').val(),
                bufferUnitMultiplier = this.bufferUnits[bufferUnit] || 1;

            bufferSize *= bufferUnitMultiplier;
            // aggregate
            var aggregateFunctions = container.find('input[name=aggre]:checked');
            aggregateFunctions = jQuery.map(
                aggregateFunctions,
                function (val, i) {
                    return val.value.replace(me.id_prefix, '');
                }
            );
            var aggregateAttribute = container.find('select.analyse-columns-dropdown option').filter(':selected').val();
            // union
            var unionLayerId = container.find('input[name=union]:checked').val();
            unionLayerId = unionLayerId && unionLayerId.replace((this.id_prefix + 'layer_'), '');
            // clip, intersect
            var intersectLayerId = container.find('input[name=intersect]:checked').val();
            intersectLayerId = intersectLayerId && intersectLayerId.replace((this.id_prefix + 'layer_'), '');
            var intersectFeatures,
                tempLayer = this.contentOptionsMap[intersectLayerId];

            if (tempLayer && tempLayer.temp) {
                tempLayer = this.contentPanel.findFeatureById(tempLayer.id);
                intersectLayerId = -1;
                intersectFeatures = [tempLayer.getFeature()];
            }

            var spatialOperator = null;
            if (container.find('input[name=spatial_join_mode]:checked').val() === 'oskari_analyse_aggregate') {
                spatialOperator = container.find('input[name=spatial_join_mode]:checked').val();
            } else {
                spatialOperator = container.find('input[name=spatial]:checked').val();
            }
            spatialOperator = spatialOperator && spatialOperator.replace(this.id_prefix, '');

            // layer union
            var layerUnionLayers = this._getLayerUnionLayers(container),
                areaCount = container.find('input.settings_area_count_field').val(),
                areaSize = container.find('input.settings_area_size_field').val(),
                areaUnit = container.find('.settings_area_size_units option:selected').val(),
                areaUnitMultiplier = this.bufferUnits[areaUnit] || 1,
                sectorCount = container.find('input.settings_sector_count_field').val();

            areaSize *= areaUnitMultiplier;
            if (areaCount > 12) {
                areaCount = me.max_areaCount;
            }

            var differenceLayerId = container.find('input[name=differenceLayer]:checked').val(),
                differenceFieldA1 = container.find('input[name=analyse-layer1-field-property]:checked').val(),
                differenceFieldB1 = container.find('input[name=analyse-layer2-field-property]:checked').val(),
                featuresA1 = container.find('input[name=analyse-layer1-field-property]:checked').map(function () {
                    return this.value;
                }).get(),
                featuresB1 = container.find('input[name=analyse-layer2-field-property]:checked').map(function () {
                    return this.value;
                }).get(),
                keyField = container.find('input[name=analyse-key-field-property]:checked').val();
            // Predefined key
            if (typeof keyField === 'undefined') {
                keyField = container.find('div#analyse-key-field > ul').text();
            }
            differenceLayerId = differenceLayerId && differenceLayerId.replace((this.id_prefix + 'layer_'), '');

            var methodSelections = {
                'buffer': {
                    methodParams: {
                        distance: bufferSize,
                        no_data: me._getNoDataValue()
                    },
                    opacity: layer.getOpacity()
                },
                'aggregate': {
                    methodParams: {
                        functions: aggregateFunctions, // TODO: param name?
                        attribute: aggregateAttribute,
                        no_data: me._getNoDataValue()
                    }
                },
                'union': {
                    methodParams: {
                        layerId: unionLayerId,
                        no_data: me._getNoDataValue()
                    }
                },
                'clip': {
                    methodParams: {
                        layerId: intersectLayerId,
                        features: intersectFeatures,
                        no_data: me._getNoDataValue()
                    }
                },
                'intersect': {
                    methodParams: {
                        layerId: intersectLayerId,
                        operator: spatialOperator, // TODO: param name?
                        features: intersectFeatures,
                        no_data: me._getNoDataValue()
                    }
                },
                'layer_union': {
                    methodParams: {
                        layers: layerUnionLayers
                    }
                },
                'areas_and_sectors': {
                    methodParams: {
                        areaCount: areaCount,
                        areaDistance: areaSize,
                        sectorCount: sectorCount
                    },
                    opacity: layer.getOpacity()
                },
                'difference': {
                    methodParams: {
                        layerId: differenceLayerId,
                        fieldA1: differenceFieldA1,
                        fieldB1: differenceFieldB1,
                        keyA1: keyField,
                        keyB1: keyField,
                        no_data: me._getNoDataValue()
                    }
                },
                'spatial_join': {
                    methodParams: {
                        layerId: differenceLayerId,
                        featuresA1: featuresA1,
                        featuresB1: featuresB1,
                        operator: spatialOperator,
                        no_data: me._getNoDataValue(),
                        locale: me.loc.spatial_join.backend_locale
                    }
                }
            };
            var s;
            for (s in methodSelections[methodName]) {
                if (methodSelections[methodName].hasOwnProperty(s)) {
                    defaultSelections[s] = methodSelections[methodName][s];
                }
            }
            return defaultSelections;
        },

        /**
         * @private @method _getAggregateLocalization
         *
         * @param {String}  funcKey Aggregate function key
         *
         * @return {String} Localized aggregate function name
         * Get localized name for aggregate function
         */
        _getAggregateLocalization: function (funcKey) {
            var aggregateOptions = this.loc.aggregate.options,
                fullKey = 'oskari_analyse_' + funcKey,
                ret = null,
                i;

            for (i = 0; i < aggregateOptions.length; i += 1) {
                if (aggregateOptions[i].id === fullKey) {
                    ret = aggregateOptions[i].label;
                    break;
                }
            }

            return ret;
        },

        /**
         * @private @method _analyseMap
         * Check parameters and execute analyse.
         *
         *
         */
        _analyseMap: function () {
            var data = {},
                me = this,
                sandbox = me.instance.getSandbox(),
                selections = me._gatherSelections(),
                functions = selections.methodParams.functions,
                showError = function (error) {
                    me.instance.showMessage(
                        me.loc.error.title,
                        me.loc.error[error] || error
                    );
                };

            me._showFeatureDataAfterAnalysis = me.mainPanel.find('input[name=showFeatureData]')[0].checked;

            var showWithoutSavingOption = me.mainPanel.find('#showFeatureDataWithoutSaving');
            if (showWithoutSavingOption[0]) {
                me._showFeatureDataWithoutSaving = me.mainPanel.find('#showFeatureDataWithoutSaving')[0].checked;
            }
            // Check that parameters are a-okay
            if (me._checkSelections(selections)) {
                // Sorry - use intersect method for clip
                if (selections.method === 'clip') {
                    selections.method = 'intersect';
                    selections.methodParams.operator = 'clip';
                }

                if (functions && functions.length) {
                    selections.methodParams.locales = [];
                    functions.forEach(function (func) {
                        selections.methodParams.locales.push(
                            me._getAggregateLocalization(func)
                        );
                    });
                }

                data.analyse = JSON.stringify(selections);

                var layerId = selections.layerId,
                    layer = sandbox.findMapLayerFromSelectedMapLayers(layerId);

                if (me.getFilterJson(layerId)) {
                    var filterJson = this.getFilterJson(layerId);
                    // If the user wanted to include only selected/clicked
                    // features, get them now from the layer.
                    if (filterJson.featureIds) {
                        // no bbox filter when selected features
                        me._getSelectedFeatureIds(layer, filterJson);
                        delete filterJson.bbox;
                    } else {
                        filterJson.featureIds = [];
                    }
                    // If the user wanted to filter with other layers geometry,
                    // get the geometry
                    if (filterJson.filterByGeometryMethod) {
                        filterJson.geometries = me.getFilterGeometry();
                        delete filterJson.bbox;
                    }
                    data.filter1 = JSON.stringify(filterJson);
                }

                // Applies to clip as well, but we changed its method to
                // intersect above
                if (selections.method === 'intersect') {
                    var intersectLayerId = selections.methodParams.layerId,
                        ilayer = sandbox.findMapLayerFromSelectedMapLayers(
                            intersectLayerId
                        ),
                        ifilterJson = this.getFilterJson(intersectLayerId);

                    if (ifilterJson) {
                        // If the user wanted to include only selected/clicked
                        // features, get them now from the layer.
                        if (ifilterJson.featureIds) {
                            this._getSelectedFeatureIds(ilayer, ifilterJson);
                        }
                        data.filter2 = JSON.stringify(ifilterJson);
                    }
                }
                // if we don't wan't to save data, let's give some data to the grid
                if (me._showFeatureDataWithoutSaving) {
                    data.saveAnalyse = false;
                    var fields = functions,
                        locales = selections.methodParams.locales,
                        noDataCnt = false,
                        k;

                    if (_.indexOf(fields, 'NoDataCnt') !== -1) {
                        noDataCnt = true;
                    }
                    fields.unshift('Property');
                    locales.unshift(me.loc.aggregatePopup.property);
                    me.grid = Oskari.clazz.create('Oskari.userinterface.component.Grid');

                    for (k = 0; k < locales.length; k += 1) {
                        me.grid.setColumnUIName(fields[k], locales[k]);
                    }
                }

                // clean the "additional info" div
                me.mainPanel.find('div.analysis_additional_info').html('');

                // Send the data for analysis to the backend
                me.instance.sandbox.postRequestByName('ShowProgressSpinnerRequest', [true]);
                me.instance.analyseService.sendAnalyseData(
                    data,
                    // Success callback
                    function (response) {
                        me.instance.sandbox.postRequestByName('ShowProgressSpinnerRequest', [false]);
                        if (response) {
                            if (response.error) {
                                showError(response.error);
                            } else {
                                me._handleAnalyseMapResponse(response, noDataCnt);
                            }
                        }
                    },
                    // Error callback
                    function (jqXHR, textStatus, errorThrown) {
                        me.instance.sandbox.postRequestByName('ShowProgressSpinnerRequest', [false]);
                        showError(textStatus);
                    }
                );
            }
        },

        /**
         * @private @method _handleAnalyseMapResponse
         * Creates the map layer from the JSON given as a param
         * and adds it to the map and subsequently to be used in further analysis.
         *
         * @param {JSON} analyseJson Layer JSON returned by server.
         * @param {Boolean} noDataCnt True if the amount of authorised features is included in analysis
         *
         */
        _handleAnalyseMapResponse: function (analyseJson, noDataCnt) {
            // TODO: some error checking perhaps?
            var i,
                mapLayerService,
                mapLayer,
                me = this,
                mlays,
                requestBuilder,
                showFeatureDataReqBuilder;

            if (me._showFeatureDataWithoutSaving) {
                var aggregateValues = analyseJson.aggregate;
                var geojson = analyseJson.geojson.features[0];

                me.instance.sandbox.postRequestByName('MapModulePlugin.AddFeaturesToMapRequest', [geojson, {
                    layerId: 'ANALYSIS_VECTOR',
                    clearPrevious: true,
                    layerOptions: null,
                    centerTo: false,
                    featureStyle: null
                }]);

                me._showAggregateResultPopup(aggregateValues, geojson, noDataCnt);
            } else {
                mapLayerService = me.instance.mapLayerService;
                // Create the layer model
                mapLayer = mapLayerService.createMapLayer(analyseJson);
                // Add the layer to the map layer service
                mapLayerService.addLayer(mapLayer);
                // Request the layer to be added to the map.
                // instance.js handles things from here on.
                requestBuilder = Oskari.requestBuilder('AddMapLayerRequest');
                me.instance.sandbox.request(this.instance, requestBuilder(mapLayer.getId()));

                // show featureData if wanted
                if (me._showFeatureDataAfterAnalysis) {
                    showFeatureDataReqBuilder = Oskari.requestBuilder('ShowFeatureDataRequest');

                    if (showFeatureDataReqBuilder) {
                        me.instance.sandbox.request(this.instance, showFeatureDataReqBuilder(mapLayer.getId()));
                    }
                }

                // Remove old layers if any
                if (analyseJson.mergeLayers) {
                    mlays = analyseJson.mergeLayers;
                    if (mlays.length > 0) {
                        // TODO: shouldn't maplayerservice send removelayer request by default on remove layer?
                        // also we need to do it before service.remove() to avoid problems on other components
                        var removeMLrequestBuilder = Oskari.requestBuilder('RemoveMapLayerRequest');

                        for (i in mlays) {
                            if (mlays.hasOwnProperty(i)) {
                                me.instance.sandbox.request(me.instance, removeMLrequestBuilder(mlays[i]));
                                mapLayerService.removeLayer(mlays[i]);
                            }
                        }
                    }
                }
            }
        },

        /**
         * @private @method _showAggregateResultPopup
         * Shows aggregate analysis results in popup
         *
         * @param {JSON} resultJson Analysis results
         *
         *[{"vaesto": [{"Kohteiden lukumäärä": "324"}, {"Tietosuojattujen kohteiden lukumäärä": "0"},..}]},{"miehet":[..
         * @param {JSON}  geojson geometry of aggregate features union
         * @param {Boolean} noDataCnt True if the amount of authorised features is included in analysis
         *
         */
        _showAggregateResultPopup: function (resultJson, geojson, noDataCnt) {
            var me = this,
                popup = Oskari.clazz.create('Oskari.userinterface.component.Popup'),
                gridModel = Oskari.clazz.create('Oskari.userinterface.component.GridModel'),
                content = this.template.wrapper.clone(),
                contentPanel = me.contentPanel,
                tmpfea = {},
                fields;
            // Array Array is used for to keep order of rows and cols
            _.forEach(resultJson, function (feature, key) {
                tmpfea = {};
                _.forEach(feature, function (sfeature, skey) {
                    _.forEach(sfeature, function (ssfeature, sskey) {
                        _.forEach(ssfeature, function (value, ssskey) {
                            tmpfea[ssskey] = value;
                        });
                    });
                    tmpfea.Property = skey;
                    gridModel.addData(tmpfea, true);
                });
            });
            gridModel.setIdField('Property');
            gridModel.setFirstField('Property');
            me.grid.setDataModel(gridModel);

            fields = gridModel.getFields();
            _.forEach(fields, function (field) {
                me.grid.setNumericField(field, me._fixedDecimalCount);
            });

            me.grid.renderTo(content);

            if (noDataCnt) {
                content.prepend('<div>' + me.loc.aggregate.footer + '</div>');
            }

            var storeBtn = Oskari.clazz.create('Oskari.userinterface.component.Button');
            storeBtn.setTitle(me.loc.aggregatePopup.store);
            storeBtn.setTooltip(me.loc.aggregatePopup.store_tooltip);
            storeBtn.setHandler(function () {
                var rq = 'MapModulePlugin.RemoveFeaturesFromMapRequest';
                me.instance.sandbox.postRequestByName(rq);
                // Store temp geometry layer
                var title = me.mainPanel.find('.settings_name_field').val() ? me.mainPanel.find('.settings_name_field').val() : '_';
                contentPanel.addFeature(me._getOLGeometry(geojson), title);
                me._showFeatureDataWithoutSaving = false;
                popup.close(true);
            });

            var closeBtn = Oskari.clazz.create('Oskari.userinterface.component.Button');
            closeBtn.setTitle(me.loc.aggregatePopup.close);
            closeBtn.setHandler(function () {
                popup.close(true);
                me._showFeatureDataWithoutSaving = false;
                var rq = 'MapModulePlugin.RemoveFeaturesFromMapRequest';
                me.instance.sandbox.postRequestByName(rq);
            });
            popup.makeDraggable({
                scroll: false,
                cancel: '.content'
            });

            popup.show(me.loc.aggregatePopup.title, content, [storeBtn, closeBtn]);
        },

        /**
         * @private @method _saveAnalyse
         * Save analyse data.
         *
         * @param {Object} selections
         * analyse params as returned by _gatherSelections()
         *
         */
        _saveAnalyse: function (selections, features) {
            // TODO: save analyse data operations
            var log = Oskari.log('Oskari.analysis.bundle.analyse.view.StartAnalyse');
            log.warn('Save analyse not implemented!!');
        },

        /**
         * @private @method _infoRequest
         * Request sandbox to open metadata info
         *
         * @param {jQuery} tools  table div where info icon is located
         * @param {int} layer_id  layer id for to retreave layer object
         *
         */
        _infoRequest: function (tools, layer_id) {
            var me = this,
                layer = me._getLayerByPrefixedId(layer_id, true);

            tools.find('div.layer-info').on('click', function () {
                var rn = 'catalogue.ShowMetadataRequest',
                    uuid = layer.getMetadataIdentifier(),
                    additionalUuids = [],
                    additionalUuidsCheck = {};
                additionalUuidsCheck[uuid] = true;

                var subLayers = layer.getSubLayers() || [],
                    subUuid;

                subLayers.forEach(function (subLayer) {
                    subUuid = subLayer.getMetadataIdentifier();
                    if (subUuid && subUuid.length && !additionalUuidsCheck[subUuid]) {
                        additionalUuidsCheck[subUuid] = true;
                        additionalUuids.push({
                            uuid: subUuid
                        });
                    }
                });

                me.instance.getSandbox().postRequestByName(
                    rn,
                    [
                        {
                            uuid: uuid
                        },
                        additionalUuids
                    ]
                );
            });
        },

        /**
         * @private @method _filterRequest
         * Open a pop-up to select filter parameters.
         *
         * @param {jQuery} tools
         * table div where filter icon is located
         * @param {String} analyse_layer_id
         * layer id for to retrieve layer object,
         * prefixed with 'oskari_analyse_layer_'.
         *
         */
        _filterRequest: function (tools, analyse_layer_id) {
            var me = this,
                filterIcon = tools.find('div.filter'),
                prevJson,
                selectedLayer;
            // From 'oskari_analyse_layer_{id}' to '{id}'
            const parsedLayerId = analyse_layer_id.replace((this.id_prefix + 'layer_'), '');
            const layer = this.instance.mapLayerService.findMapLayer(parsedLayerId);

            var fixedOptions = {
                addLinkToAggregateValues: true,
                loc: me.instance.getLocalization('layer')
            };
            me.filterDialog = Oskari.clazz.create(
                'Oskari.userinterface.component.FilterDialog',
                fixedOptions
            );
            me.aggregateAnalyseFilter = Oskari.clazz.create(
                'Oskari.analysis.bundle.analyse.aggregateAnalyseFilter',
                me.filterDialog
            );

            filterIcon.off('click');
            filterIcon.on('click', function () {
                const layerId = layer.getId();
                const hasSelectedFeatures = me.instance.getSelectionsForLayer(layerId).length > 0;
                const hasSelectedGeometry = me.contentPanel.selectedGeometry !== null;

                if (!me._filterPopups[layerId]) {
                    prevJson = me.getFilterJson(layerId);
                    selectedLayer = me._getSelectedMapLayer();
                    // Check weather the layer is selected of not
                    if (layerId === selectedLayer._id) {
                        layer._isLayerSelected = true;
                    } else {
                        layer._isLayerSelected = false;
                    }

                    me.filterDialog.createFilterDialog(layer, prevJson, function () {
                        me.instance.analyseService._returnAnalysisOfTypeAggregate(_.bind(me.aggregateAnalyseFilter.addAggregateFilterFunctionality, me));
                    }, hasSelectedFeatures, hasSelectedGeometry);

                    me._filterPopups[layerId] = true;
                    me._userSetFilter[layerId] = true;
                    // If there's already filter values for current layer, populate the dialog with them.
                    if (prevJson && !jQuery.isEmptyObject(prevJson)) {
                        me.filterDialog.setCloseButtonHandler(function () {
                            me._filterPopups[layerId] = null;
                        });
                        me.filterDialog.setClearButtonHandler(function () {
                            // Removes the filter for the layer
                            me.removeFilterJson(layer.getId());
                        });
                        me.filterDialog.setUpdateButtonHandler(function () {
                            // Get the filter values from the dialog
                            var filterJson = me.filterDialog.getFilterValues();
                            me.setFilterJson(layer.getId(), filterJson);
                            layer.setFilterJson(filterJson);
                            // Update filter icon
                            me.updateFilterIcon(layer.getId());
                            me._filterPopups[layerId] = null;
                        });
                    }
                }
            });
        },

        /**
         * @private @method _removeLayerRequest
         * Requests to remove a layer from the map.
         *
         * @param  {String} analyseLayerId
         *
         */
        _removeLayerRequest: function (analyseLayerId) {
            var sandbox = this.instance.getSandbox();
            var layer = this._getLayerByPrefixedId(analyseLayerId);
            var reqBuilder = Oskari.requestBuilder('RemoveMapLayerRequest');

            if (layer && reqBuilder) {
                sandbox.request(this.instance, reqBuilder(layer.getId()));
            }
        },

        /**
         * @private @method _getSelectedMapLayer
         * Returns the Oskari layer object for currently selected layer
         *
         *
         * @return {Object/null} an Oskari layer or null if no layer selected
         */
        _getSelectedMapLayer: function () {
            var selectedLayer = this._selectedLayers();
            var layerId;
            // FIXME: what's going on here?
            selectedLayer = selectedLayer && selectedLayer[0];

            if (!selectedLayer) {
                return;
            }

            if (selectedLayer.temp) {
                layerId = selectedLayer.id;
                return this.contentPanel.findFeatureById(layerId);
            }
            return this._getLayerByPrefixedId(selectedLayer.id);
        },

        /**
         * @method _getSelectedFeatureIds
         * Gets the clicked/selected features' ids and sets it to filterJson.
         *
         * @param {Oskari.mapframework.bundle.mapwfs2.domain.WFSLayer} layer
         * @param {JSON} filterJson
         *
         */
        _getSelectedFeatureIds: function (layer, filterJson) {
            if (!layer || !filterJson) {
                return;
            }
            filterJson.featureIds = this.instance.getSelectionsForLayer(layer.getId());
        },

        /**
         * @private @method _addPropertyTypes
         * Add field property types {fieldname1:type1,...} to layer and wps_params
         *
         * @param layers selected layers
         *
         */
        _addPropertyTypes: function (layers) {
            var me = this;
            var analyseService = me.instance.analyseService;

            layers.forEach(function (layer) {
                if (layer.getLayerType() === 'wfs') {
                    if (Object.keys(layer.getPropertyTypes()).length === 0) {
                        analyseService.loadWFSLayerPropertiesAndTypes(
                            layer.getId()
                        );
                    }
                }
            });
        },

        /**
         * @private @method _isNumericField
         * Check if wfs field type is numeric
         *
         * @param fieldName  property name
         *
         */
        _isNumericField: function (name) {
            const layer = this._getSelectedMapLayer();
            if (!layer) {
                return false;
            }
            return layer.getPropertyTypes()[name] === 'number';
        },

        /**
         * @private @method _getNoDataValue
         * Get selected layer's noDataValue value for wps analyse
         * There isn't noDataValue for selected layer, if return value is undefined
         *
         *
         * @return no_data value
         */
        _getNoDataValue: function () {
            const selectedLayer = this._getSelectedMapLayer();
            if (!selectedLayer) {
                return;
            }
            const { data = {} } = selectedLayer.getAttributes();
            return data.noDataValue;
        },

        /**
         * @private @method _modifyAnalyseName
         * Modify analyse name when analyse layer is changed
         *
         *
         */
        _modifyAnalyseName: function () {
            var me = this,
                container = me.mainPanel,
                selected_layer = me._getSelectedMapLayer(),
                name = '_';

            if (selected_layer) {
                name = selected_layer.getName().substring(0, 15) + name;
            }
            container.find('.settings_name_field').attr({
                'value': name,
                'placeholder': me.loc.analyse_name.tooltip
            });
        },

        /**
         * @method showInfos
         * Inform user, if more than 10 fields in analyse input layer
         *
         *
         */
        showInfos: function () {
            var me = this,
                selectedLayer = me._getSelectedMapLayer(),
                isAnalyseLayer,
                exceedsFieldsCount,
                tooManyFieldsMsg;

            // No layer selected - nothing to do here
            if (!selectedLayer) {
                return;
            }

            isAnalyseLayer = selectedLayer.getId().toString()
                .indexOf(me.layer_prefix) > -1;
            // No checks for analysis layers
            if (isAnalyseLayer) {
                return;
            }

            if (selectedLayer.isLayerOfType('userlayer')) {
                me.instance.showMessage(me.loc.infos.title, me.loc.infos.userlayer);
                // no need to count fields for userlayer
                return;
            }
            exceedsFieldsCount = (Object.keys(selectedLayer.getPropertyTypes()).length > me.max_analyse_layer_fields);

            if (exceedsFieldsCount) {
                tooManyFieldsMsg = (me.loc.infos.layer +
                    ' ' + selectedLayer.getName() +
                    ' ' + me.loc.infos.over10);
                me.instance.showMessage(me.loc.infos.title, tooManyFieldsMsg);
            }
        },

        /**
         * @private @method _checkParamsSelection
         * Check if the selected layer has more fields available
         * than the permitted maximum number and if so,
         * disable the 'all fields' selection.
         *
         *
         */
        _checkParamsSelection: function () {
            const selectedLayer = this._getSelectedMapLayer();
            const exceedsFieldsCount = this._layerHasProperties(selectedLayer)
                && Object.keys(selectedLayer.getPropertyTypes()).length > this.max_analyse_layer_fields;

            if (exceedsFieldsCount) {
                this._disableAllParamsSelection();
            } else if (selectedLayer) {
                var layerType = selectedLayer.getLayerType();
                if (layerType === 'temp' || layerType === 'userlayer') {
                    this._disableParamsIfNoList();
                }
            } else {
                this._enableAllParamsSelection();
            }
        },

        _checkMethodSelection: function () {
            var selectedLayer = this._getSelectedMapLayer(),
                methodLabels = jQuery('.accordion').find('.method_radiolabel'),
                layerType;
            if (selectedLayer) {
                layerType = selectedLayer.getLayerType();
                if (layerType === 'temp') {
                    this._disableMethodsForTempLayer(methodLabels);
                } else {
                    this._enableAllMethods(methodLabels);
                }
            }
        },

        _disableMethodsForTempLayer: function (methodLabels) {
            methodLabels.find('input#oskari_analyse_aggregate').prop('disabled', true).prop('checked', false);
            methodLabels.find('input#oskari_analyse_difference').prop('disabled', true).prop('checked', false);
            methodLabels.find('input#oskari_analyse_buffer').prop('checked', true);
        },

        _enableAllMethods: function (methodLabels) {
            methodLabels.find('input').prop('disabled', false);
        },

        _enableAllParamsSelection: function () {
            var paramsCont = jQuery('.analyse-columns-container');

            paramsCont
                .find('#oskari_analyse_all')
                .prop('disabled', false)
                .prop('checked', true)
                .trigger('change');
        },

        _disableParamsIfNoList: function () {
            var paramsCont = jQuery('.analyse-columns-container');

            paramsCont
                .find('#oskari_analyse_all')
                .prop('disabled', true);

            paramsCont
                .find('#oskari_analyse_select')
                .prop('disabled', true);

            paramsCont
                .find('#oskari_analyse_none')
                .prop('checked', true)
                .trigger('change');
        },

        _disableAllParamsSelection: function () {
            var paramsCont = jQuery('.analyse-columns-container');

            paramsCont
                .find('#oskari_analyse_all')
                .prop('disabled', true);

            paramsCont
                .find('#oskari_analyse_select')
                .prop('checked', true)
                .trigger('change');
        },

        /**
         * @method destroy
         * Destroyes/removes this view from the screen.
         */
        destroy: function () {
            this.mainPanel.remove();
        },

        hide: function () {
            this.mainPanel.hide();
        },

        show: function () {
            this.mainPanel.show();
        },

        setEnabled: function (enabled) {
            this.isEnabled = enabled;

            if (enabled) {
                this.contentPanel.start();
            } else {
                this.contentPanel.stop();
            }
        },

        getEnabled: function () {
            return this.isEnabled;
        },

        getState: function () {
            return {}; // TODO: later this._gatherSelections();
        },

        setState: function (formState) {
            return undefined;
        }
    });
