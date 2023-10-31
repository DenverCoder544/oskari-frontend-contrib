import React from 'react';
import PropTypes from 'prop-types';
import { Controller } from 'oskari-ui/util';
import { Message } from 'oskari-ui';
import { Content, RadioGroup, RadioButton } from './styled';
import { InfoIcon } from 'oskari-ui/components/icons';
import { METHODS, METHOD_OPTIONS } from '../constants';

export const Methods = ({ controller, state, layersCount, layer }) => {
    const disabledMethods = METHODS.filter(method => {
        const { minLayers = 0, validateLayer = [] } = METHOD_OPTIONS[method] || {};
        if (layersCount < minLayers) {
            return false;
        }
        return !validateLayer.every(func => func(layer));
    });
    return (
        <Content>
            <RadioGroup value={state.method}
                onChange={(e) => controller.setMethod(e.target.value)}>
                {METHODS.map(method => {
                    const disabled = disabledMethods.includes(method)
                    return (
                        <RadioButton key={method} value={method} disabled={disabled}>
                            <Message messageKey={`AnalyseView.method.options.${method}.label`}/>
                            <InfoIcon title={<Message messageKey={`AnalyseView.method.options.${method}.tooltip`}/>} />
                        </RadioButton>
                    );
                })}
            </RadioGroup>
        </Content>
    );
};

Methods.propTypes = {
    state: PropTypes.object.isRequired,
    controller: PropTypes.instanceOf(Controller).isRequired
};
