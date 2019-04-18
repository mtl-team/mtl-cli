"use strict";

Object.defineProperty(exports, "__esModule", {
                      value: true
                      });
function u8cParse(data) {
    var _data$viewmodel = data.viewmodel,
    entities = _data$viewmodel.entities,
    actions = _data$viewmodel.actions,
    _data$viewApplication = data.viewApplication,
    view = _data$viewApplication.view,
    cCardKey = _data$viewApplication.cCardKey,
    cBillNo = _data$viewApplication.cBillNo,
    cBillType = _data$viewApplication.cBillType;
    
    var viewItem = {
    templateId: view.iTplId,
    templateTitle: view.cTemplateTitle,
    templateMode: view.iTplMode,
    checkCode: "",
    version: 0
    };
    viewItem.containers = view.containers.map(function (obj) {
                                              return _parseContainer(obj, entities);
                                              });
    viewItem.actions = actions.reduce(function (previous, current) {
                                      var cCommand = current.cCommand;
                                      delete current.cCommand;
                                      current.cParameter = current.cParameter && JSON.parse(current.cParameter);
                                      previous[cCommand] = _prettify(current);
                                      return previous;
                                      }, {});
    
    return {
    view: viewItem,
    billno: cBillNo,
    cardBillno: cCardKey,
    templateName: cBillType
    };
}

function _parseControl(control, entity) {
    
    var properties = control;
    
    var action = null;
    var cItemName = properties.cItemName;
    if (cItemName) {
        var field = entity.fields && entity.fields.find(function (obj) {
                                                        return cItemName == obj.cItemName;
                                                        });
        if (field) {
            action = field.cCommand;
        }
        delete properties.cItemName;
    }
    var controlType = properties.cControlType;
    if (controlType) {
        delete properties.cControlType;
    }
    
    var dataSource = properties.cDataSourceName;
    if (dataSource) {
        delete properties.cDataSourceName;
    }
    
    var bindField = properties.cFieldName;
    if (bindField) {
        delete properties.cFieldName;
    }
    return {
    controlType: controlType,
    dataSource: dataSource || "",
    bindField: bindField || "",
    action: action || "",
    properties: _prettify(properties)
    };
}

function _parseContainer(container, entities) {
    
    var properties = container;
    
    var controlType = properties.cControlType;
    if (controlType) {
        delete properties.cControlType;
    }
    
    var dataSource = properties.cDataSourceName;
    if (dataSource) {
        delete properties.cDataSourceName;
    }
    
    var bindField = properties.cFieldName;
    if (bindField) {
        delete properties.cFieldName;
    }
    
    var containerItems = [];
    var containers = properties.containers;
    if (containers) {
        containerItems = containers.map(function (obj) {
                                        return _parseContainer(obj, entities);
                                        }) || [];
        delete properties.containers;
    }
    
    var controlItems = [];
    var cGroupCode = properties.cGroupCode;
    var controls = properties.controls;
    if (controls) {
        var entity = cGroupCode && entities.find(function (obj) {
                                                 return cGroupCode == obj.parentKey;
                                                 }) || {};
        controlItems = controls.map(function (obj) {
                                    return _parseControl(obj, entity);
                                    }) || [];
        delete properties.controls;
    }
    if (cGroupCode) {
        delete properties.cGroupCode;
    }
    
    return {
    controlType: controlType,
    dataSource: dataSource || "",
    bindField: bindField || "",
    action: "",
    properties: _prettify(properties),
    containers: containerItems,
    controls: controlItems
    };
}

function _prettify(object) {
    var prettyObj = {};
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;
    
    try {
        for (var _iterator = Object.keys(object)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var key = _step.value;
            
            var firstChar = key.charAt(0);
            var secondChar = key.charAt(1);
            if (['i', 'c', 'b'].includes(firstChar) && secondChar == secondChar.toUpperCase()) {
                var newKey = String(secondChar.toLowerCase()) + key.substring(2);
                prettyObj[newKey] = object[key];
            } else {
                prettyObj[key] = object[key];
            }
        }
    } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion && _iterator.return) {
                _iterator.return();
            }
        } finally {
            if (_didIteratorError) {
                throw _iteratorError;
            }
        }
    }
    
    return prettyObj;
}

this.u8cParse = u8cParse;
