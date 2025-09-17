/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/@base-ui-components/react/esm/accordion/header/AccordionHeader.js":
/*!****************************************************************************************!*\
  !*** ./node_modules/@base-ui-components/react/esm/accordion/header/AccordionHeader.js ***!
  \****************************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AccordionHeader: () => (/* binding */ AccordionHeader)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var _utils_useRenderElement_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../utils/useRenderElement.js */ "./node_modules/@base-ui-components/react/esm/utils/useRenderElement.js");
/* harmony import */ var _item_AccordionItemContext_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../item/AccordionItemContext.js */ "./node_modules/@base-ui-components/react/esm/accordion/item/AccordionItemContext.js");
/* harmony import */ var _item_styleHooks_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../item/styleHooks.js */ "./node_modules/@base-ui-components/react/esm/accordion/item/styleHooks.js");
'use client';






/**
 * A heading that labels the corresponding panel.
 * Renders an `<h3>` element.
 *
 * Documentation: [Base UI Accordion](https://base-ui.com/react/components/accordion)
 */
const AccordionHeader = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.forwardRef(function AccordionHeader(componentProps, forwardedRef) {
  const {
    render,
    className,
    ...elementProps
  } = componentProps;
  const {
    state
  } = (0,_item_AccordionItemContext_js__WEBPACK_IMPORTED_MODULE_2__.useAccordionItemContext)();
  const element = (0,_utils_useRenderElement_js__WEBPACK_IMPORTED_MODULE_1__.useRenderElement)('h3', componentProps, {
    state,
    ref: forwardedRef,
    props: elementProps,
    customStyleHookMapping: _item_styleHooks_js__WEBPACK_IMPORTED_MODULE_3__.accordionStyleHookMapping
  });
  return element;
});
if (true) AccordionHeader.displayName = "AccordionHeader";

/***/ }),

/***/ "./node_modules/@base-ui-components/react/esm/accordion/item/AccordionItem.js":
/*!************************************************************************************!*\
  !*** ./node_modules/@base-ui-components/react/esm/accordion/item/AccordionItem.js ***!
  \************************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AccordionItem: () => (/* binding */ AccordionItem)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var _base_ui_components_utils_useMergedRefs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @base-ui-components/utils/useMergedRefs */ "./node_modules/@base-ui-components/utils/esm/useMergedRefs.js");
/* harmony import */ var _base_ui_components_utils_useEventCallback__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @base-ui-components/utils/useEventCallback */ "./node_modules/@base-ui-components/utils/esm/useEventCallback.js");
/* harmony import */ var _utils_useBaseUiId_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../utils/useBaseUiId.js */ "./node_modules/@base-ui-components/react/esm/utils/useBaseUiId.js");
/* harmony import */ var _collapsible_root_useCollapsibleRoot_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../collapsible/root/useCollapsibleRoot.js */ "./node_modules/@base-ui-components/react/esm/collapsible/root/useCollapsibleRoot.js");
/* harmony import */ var _collapsible_root_CollapsibleRootContext_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../collapsible/root/CollapsibleRootContext.js */ "./node_modules/@base-ui-components/react/esm/collapsible/root/CollapsibleRootContext.js");
/* harmony import */ var _composite_list_useCompositeListItem_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../composite/list/useCompositeListItem.js */ "./node_modules/@base-ui-components/react/esm/composite/list/useCompositeListItem.js");
/* harmony import */ var _root_AccordionRootContext_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../root/AccordionRootContext.js */ "./node_modules/@base-ui-components/react/esm/accordion/root/AccordionRootContext.js");
/* harmony import */ var _AccordionItemContext_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./AccordionItemContext.js */ "./node_modules/@base-ui-components/react/esm/accordion/item/AccordionItemContext.js");
/* harmony import */ var _styleHooks_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./styleHooks.js */ "./node_modules/@base-ui-components/react/esm/accordion/item/styleHooks.js");
/* harmony import */ var _utils_useRenderElement_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../../utils/useRenderElement.js */ "./node_modules/@base-ui-components/react/esm/utils/useRenderElement.js");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
'use client';













/**
 * Groups an accordion header with the corresponding panel.
 * Renders a `<div>` element.
 *
 * Documentation: [Base UI Accordion](https://base-ui.com/react/components/accordion)
 */

const AccordionItem = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.forwardRef(function AccordionItem(componentProps, forwardedRef) {
  const {
    className,
    disabled: disabledProp = false,
    onOpenChange: onOpenChangeProp,
    render,
    value: valueProp,
    ...elementProps
  } = componentProps;
  const {
    ref: listItemRef,
    index
  } = (0,_composite_list_useCompositeListItem_js__WEBPACK_IMPORTED_MODULE_6__.useCompositeListItem)();
  const mergedRef = (0,_base_ui_components_utils_useMergedRefs__WEBPACK_IMPORTED_MODULE_1__.useMergedRefs)(forwardedRef, listItemRef);
  const {
    disabled: contextDisabled,
    handleValueChange,
    state: rootState,
    value: openValues
  } = (0,_root_AccordionRootContext_js__WEBPACK_IMPORTED_MODULE_7__.useAccordionRootContext)();
  const value = valueProp ?? index;
  const disabled = disabledProp || contextDisabled;
  const isOpen = react__WEBPACK_IMPORTED_MODULE_0__.useMemo(() => {
    if (!openValues) {
      return false;
    }
    for (let i = 0; i < openValues.length; i += 1) {
      if (openValues[i] === value) {
        return true;
      }
    }
    return false;
  }, [openValues, value]);
  const onOpenChange = (0,_base_ui_components_utils_useEventCallback__WEBPACK_IMPORTED_MODULE_2__.useEventCallback)(nextOpen => {
    handleValueChange(value, nextOpen);
    onOpenChangeProp?.(nextOpen);
  });
  const collapsible = (0,_collapsible_root_useCollapsibleRoot_js__WEBPACK_IMPORTED_MODULE_4__.useCollapsibleRoot)({
    open: isOpen,
    onOpenChange,
    disabled
  });
  const collapsibleState = react__WEBPACK_IMPORTED_MODULE_0__.useMemo(() => ({
    open: collapsible.open,
    disabled: collapsible.disabled,
    hidden: !collapsible.mounted
  }), [collapsible.open, collapsible.disabled, collapsible.mounted]);
  const collapsibleContext = react__WEBPACK_IMPORTED_MODULE_0__.useMemo(() => ({
    ...collapsible,
    onOpenChange,
    state: collapsibleState,
    transitionStatus: collapsible.transitionStatus
  }), [collapsible, collapsibleState, onOpenChange]);
  const state = react__WEBPACK_IMPORTED_MODULE_0__.useMemo(() => ({
    ...rootState,
    index,
    disabled,
    open: isOpen
  }), [disabled, index, isOpen, rootState]);
  const [triggerId, setTriggerId] = react__WEBPACK_IMPORTED_MODULE_0__.useState((0,_utils_useBaseUiId_js__WEBPACK_IMPORTED_MODULE_3__.useBaseUiId)());
  const accordionItemContext = react__WEBPACK_IMPORTED_MODULE_0__.useMemo(() => ({
    open: isOpen,
    state,
    setTriggerId,
    triggerId
  }), [isOpen, state, setTriggerId, triggerId]);
  const element = (0,_utils_useRenderElement_js__WEBPACK_IMPORTED_MODULE_10__.useRenderElement)('div', componentProps, {
    state,
    ref: mergedRef,
    props: elementProps,
    customStyleHookMapping: _styleHooks_js__WEBPACK_IMPORTED_MODULE_9__.accordionStyleHookMapping
  });
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_collapsible_root_CollapsibleRootContext_js__WEBPACK_IMPORTED_MODULE_5__.CollapsibleRootContext.Provider, {
    value: collapsibleContext,
    children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_AccordionItemContext_js__WEBPACK_IMPORTED_MODULE_8__.AccordionItemContext.Provider, {
      value: accordionItemContext,
      children: element
    })
  });
});
if (true) AccordionItem.displayName = "AccordionItem";

/***/ }),

/***/ "./node_modules/@base-ui-components/react/esm/accordion/item/AccordionItemContext.js":
/*!*******************************************************************************************!*\
  !*** ./node_modules/@base-ui-components/react/esm/accordion/item/AccordionItemContext.js ***!
  \*******************************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AccordionItemContext: () => (/* binding */ AccordionItemContext),
/* harmony export */   useAccordionItemContext: () => (/* binding */ useAccordionItemContext)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
'use client';


const AccordionItemContext = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createContext(undefined);
if (true) AccordionItemContext.displayName = "AccordionItemContext";
function useAccordionItemContext() {
  const context = react__WEBPACK_IMPORTED_MODULE_0__.useContext(AccordionItemContext);
  if (context === undefined) {
    throw new Error('Base UI: AccordionItemContext is missing. Accordion parts must be placed within <Accordion.Item>.');
  }
  return context;
}

/***/ }),

/***/ "./node_modules/@base-ui-components/react/esm/accordion/item/AccordionItemDataAttributes.js":
/*!**************************************************************************************************!*\
  !*** ./node_modules/@base-ui-components/react/esm/accordion/item/AccordionItemDataAttributes.js ***!
  \**************************************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AccordionItemDataAttributes: () => (/* binding */ AccordionItemDataAttributes)
/* harmony export */ });
let AccordionItemDataAttributes = /*#__PURE__*/function (AccordionItemDataAttributes) {
  /**
   * Indicates the index of the accordion item.
   * @type {number}
   */
  AccordionItemDataAttributes["index"] = "data-index";
  /**
   * Present when the accordion item is disabled.
   */
  AccordionItemDataAttributes["disabled"] = "data-disabled";
  /**
   * Present when the accordion item is open.
   */
  AccordionItemDataAttributes["open"] = "data-open";
  return AccordionItemDataAttributes;
}({});

/***/ }),

/***/ "./node_modules/@base-ui-components/react/esm/accordion/item/styleHooks.js":
/*!*********************************************************************************!*\
  !*** ./node_modules/@base-ui-components/react/esm/accordion/item/styleHooks.js ***!
  \*********************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   accordionStyleHookMapping: () => (/* binding */ accordionStyleHookMapping)
/* harmony export */ });
/* harmony import */ var _utils_collapsibleOpenStateMapping_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../utils/collapsibleOpenStateMapping.js */ "./node_modules/@base-ui-components/react/esm/utils/collapsibleOpenStateMapping.js");
/* harmony import */ var _utils_styleHookMapping_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../utils/styleHookMapping.js */ "./node_modules/@base-ui-components/react/esm/utils/styleHookMapping.js");
/* harmony import */ var _AccordionItemDataAttributes_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./AccordionItemDataAttributes.js */ "./node_modules/@base-ui-components/react/esm/accordion/item/AccordionItemDataAttributes.js");



const accordionStyleHookMapping = {
  ..._utils_collapsibleOpenStateMapping_js__WEBPACK_IMPORTED_MODULE_0__.collapsibleOpenStateMapping,
  index: value => {
    return Number.isInteger(value) ? {
      [_AccordionItemDataAttributes_js__WEBPACK_IMPORTED_MODULE_2__.AccordionItemDataAttributes.index]: String(value)
    } : null;
  },
  ..._utils_styleHookMapping_js__WEBPACK_IMPORTED_MODULE_1__.transitionStatusMapping,
  value: () => null
};

/***/ }),

/***/ "./node_modules/@base-ui-components/react/esm/accordion/panel/AccordionPanel.js":
/*!**************************************************************************************!*\
  !*** ./node_modules/@base-ui-components/react/esm/accordion/panel/AccordionPanel.js ***!
  \**************************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AccordionPanel: () => (/* binding */ AccordionPanel)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var _base_ui_components_utils_useIsoLayoutEffect__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @base-ui-components/utils/useIsoLayoutEffect */ "./node_modules/@base-ui-components/utils/esm/useIsoLayoutEffect.js");
/* harmony import */ var _base_ui_components_utils_warn__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @base-ui-components/utils/warn */ "./node_modules/@base-ui-components/utils/esm/warn.js");
/* harmony import */ var _collapsible_root_CollapsibleRootContext_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../collapsible/root/CollapsibleRootContext.js */ "./node_modules/@base-ui-components/react/esm/collapsible/root/CollapsibleRootContext.js");
/* harmony import */ var _collapsible_panel_useCollapsiblePanel_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../collapsible/panel/useCollapsiblePanel.js */ "./node_modules/@base-ui-components/react/esm/collapsible/panel/useCollapsiblePanel.js");
/* harmony import */ var _root_AccordionRootContext_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../root/AccordionRootContext.js */ "./node_modules/@base-ui-components/react/esm/accordion/root/AccordionRootContext.js");
/* harmony import */ var _item_AccordionItemContext_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../item/AccordionItemContext.js */ "./node_modules/@base-ui-components/react/esm/accordion/item/AccordionItemContext.js");
/* harmony import */ var _item_styleHooks_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../item/styleHooks.js */ "./node_modules/@base-ui-components/react/esm/accordion/item/styleHooks.js");
/* harmony import */ var _AccordionPanelCssVars_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./AccordionPanelCssVars.js */ "./node_modules/@base-ui-components/react/esm/accordion/panel/AccordionPanelCssVars.js");
/* harmony import */ var _utils_useOpenChangeComplete_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../../utils/useOpenChangeComplete.js */ "./node_modules/@base-ui-components/react/esm/utils/useOpenChangeComplete.js");
/* harmony import */ var _utils_useRenderElement_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../../utils/useRenderElement.js */ "./node_modules/@base-ui-components/react/esm/utils/useRenderElement.js");
'use client';












/**
 * A collapsible panel with the accordion item contents.
 * Renders a `<div>` element.
 *
 * Documentation: [Base UI Accordion](https://base-ui.com/react/components/accordion)
 */
const AccordionPanel = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.forwardRef(function AccordionPanel(componentProps, forwardedRef) {
  const {
    className,
    hiddenUntilFound: hiddenUntilFoundProp,
    keepMounted: keepMountedProp,
    id: idProp,
    render,
    ...elementProps
  } = componentProps;
  const {
    hiddenUntilFound: contextHiddenUntilFound,
    keepMounted: contextKeepMounted
  } = (0,_root_AccordionRootContext_js__WEBPACK_IMPORTED_MODULE_5__.useAccordionRootContext)();
  const {
    abortControllerRef,
    animationTypeRef,
    height,
    mounted,
    onOpenChange,
    open,
    panelId,
    panelRef,
    runOnceAnimationsFinish,
    setDimensions,
    setHiddenUntilFound,
    setKeepMounted,
    setMounted,
    setOpen,
    setVisible,
    transitionDimensionRef,
    visible,
    width,
    setPanelIdState,
    transitionStatus
  } = (0,_collapsible_root_CollapsibleRootContext_js__WEBPACK_IMPORTED_MODULE_3__.useCollapsibleRootContext)();
  const hiddenUntilFound = hiddenUntilFoundProp ?? contextHiddenUntilFound;
  const keepMounted = keepMountedProp ?? contextKeepMounted;
  if (true) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    (0,_base_ui_components_utils_useIsoLayoutEffect__WEBPACK_IMPORTED_MODULE_1__.useIsoLayoutEffect)(() => {
      if (keepMountedProp === false && hiddenUntilFound) {
        (0,_base_ui_components_utils_warn__WEBPACK_IMPORTED_MODULE_2__.warn)('The `keepMounted={false}` prop on a Accordion.Panel will be ignored when using `contextHiddenUntilFound` on the Panel or the Root since it requires the panel to remain mounted when closed.');
      }
    }, [hiddenUntilFound, keepMountedProp]);
  }
  (0,_base_ui_components_utils_useIsoLayoutEffect__WEBPACK_IMPORTED_MODULE_1__.useIsoLayoutEffect)(() => {
    if (idProp) {
      setPanelIdState(idProp);
      return () => {
        setPanelIdState(undefined);
      };
    }
    return undefined;
  }, [idProp, setPanelIdState]);
  (0,_base_ui_components_utils_useIsoLayoutEffect__WEBPACK_IMPORTED_MODULE_1__.useIsoLayoutEffect)(() => {
    setHiddenUntilFound(hiddenUntilFound);
  }, [setHiddenUntilFound, hiddenUntilFound]);
  (0,_base_ui_components_utils_useIsoLayoutEffect__WEBPACK_IMPORTED_MODULE_1__.useIsoLayoutEffect)(() => {
    setKeepMounted(keepMounted);
  }, [setKeepMounted, keepMounted]);
  (0,_utils_useOpenChangeComplete_js__WEBPACK_IMPORTED_MODULE_9__.useOpenChangeComplete)({
    open: open && transitionStatus === 'idle',
    ref: panelRef,
    onComplete() {
      if (!open) {
        return;
      }
      setDimensions({
        width: undefined,
        height: undefined
      });
    }
  });
  const {
    props
  } = (0,_collapsible_panel_useCollapsiblePanel_js__WEBPACK_IMPORTED_MODULE_4__.useCollapsiblePanel)({
    abortControllerRef,
    animationTypeRef,
    externalRef: forwardedRef,
    height,
    hiddenUntilFound,
    id: idProp ?? panelId,
    keepMounted,
    mounted,
    onOpenChange,
    open,
    panelRef,
    runOnceAnimationsFinish,
    setDimensions,
    setMounted,
    setOpen,
    setVisible,
    transitionDimensionRef,
    visible,
    width
  });
  const {
    state,
    triggerId
  } = (0,_item_AccordionItemContext_js__WEBPACK_IMPORTED_MODULE_6__.useAccordionItemContext)();
  const panelState = react__WEBPACK_IMPORTED_MODULE_0__.useMemo(() => ({
    ...state,
    transitionStatus
  }), [state, transitionStatus]);
  const element = (0,_utils_useRenderElement_js__WEBPACK_IMPORTED_MODULE_10__.useRenderElement)('div', componentProps, {
    state: panelState,
    ref: [forwardedRef, panelRef],
    props: [props, {
      'aria-labelledby': triggerId,
      role: 'region',
      style: {
        [_AccordionPanelCssVars_js__WEBPACK_IMPORTED_MODULE_8__.AccordionPanelCssVars.accordionPanelHeight]: height === undefined ? 'auto' : `${height}px`,
        [_AccordionPanelCssVars_js__WEBPACK_IMPORTED_MODULE_8__.AccordionPanelCssVars.accordionPanelWidth]: width === undefined ? 'auto' : `${width}px`
      }
    }, elementProps],
    customStyleHookMapping: _item_styleHooks_js__WEBPACK_IMPORTED_MODULE_7__.accordionStyleHookMapping
  });
  const shouldRender = keepMounted || hiddenUntilFound || !keepMounted && mounted;
  if (!shouldRender) {
    return null;
  }
  return element;
});
if (true) AccordionPanel.displayName = "AccordionPanel";

/***/ }),

/***/ "./node_modules/@base-ui-components/react/esm/accordion/panel/AccordionPanelCssVars.js":
/*!*********************************************************************************************!*\
  !*** ./node_modules/@base-ui-components/react/esm/accordion/panel/AccordionPanelCssVars.js ***!
  \*********************************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AccordionPanelCssVars: () => (/* binding */ AccordionPanelCssVars)
/* harmony export */ });
let AccordionPanelCssVars = /*#__PURE__*/function (AccordionPanelCssVars) {
  /**
   * The accordion panel's height.
   * @type {number}
   */
  AccordionPanelCssVars["accordionPanelHeight"] = "--accordion-panel-height";
  /**
   * The accordion panel's width.
   * @type {number}
   */
  AccordionPanelCssVars["accordionPanelWidth"] = "--accordion-panel-width";
  return AccordionPanelCssVars;
}({});

/***/ }),

/***/ "./node_modules/@base-ui-components/react/esm/accordion/root/AccordionRoot.js":
/*!************************************************************************************!*\
  !*** ./node_modules/@base-ui-components/react/esm/accordion/root/AccordionRoot.js ***!
  \************************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AccordionRoot: () => (/* binding */ AccordionRoot)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var _base_ui_components_utils_useControlled__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @base-ui-components/utils/useControlled */ "./node_modules/@base-ui-components/utils/esm/useControlled.js");
/* harmony import */ var _base_ui_components_utils_useEventCallback__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @base-ui-components/utils/useEventCallback */ "./node_modules/@base-ui-components/utils/esm/useEventCallback.js");
/* harmony import */ var _base_ui_components_utils_useIsoLayoutEffect__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @base-ui-components/utils/useIsoLayoutEffect */ "./node_modules/@base-ui-components/utils/esm/useIsoLayoutEffect.js");
/* harmony import */ var _base_ui_components_utils_warn__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @base-ui-components/utils/warn */ "./node_modules/@base-ui-components/utils/esm/warn.js");
/* harmony import */ var _composite_list_CompositeList_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../composite/list/CompositeList.js */ "./node_modules/@base-ui-components/react/esm/composite/list/CompositeList.js");
/* harmony import */ var _direction_provider_DirectionContext_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../direction-provider/DirectionContext.js */ "./node_modules/@base-ui-components/react/esm/direction-provider/DirectionContext.js");
/* harmony import */ var _AccordionRootContext_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./AccordionRootContext.js */ "./node_modules/@base-ui-components/react/esm/accordion/root/AccordionRootContext.js");
/* harmony import */ var _utils_useRenderElement_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../../utils/useRenderElement.js */ "./node_modules/@base-ui-components/react/esm/utils/useRenderElement.js");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
'use client';











const rootStyleHookMapping = {
  value: () => null
};

/**
 * Groups all parts of the accordion.
 * Renders a `<div>` element.
 *
 * Documentation: [Base UI Accordion](https://base-ui.com/react/components/accordion)
 */
const AccordionRoot = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.forwardRef(function AccordionRoot(componentProps, forwardedRef) {
  const {
    render,
    className,
    disabled = false,
    hiddenUntilFound: hiddenUntilFoundProp,
    keepMounted: keepMountedProp,
    loop = true,
    onValueChange: onValueChangeProp,
    openMultiple = true,
    orientation = 'vertical',
    value: valueProp,
    defaultValue: defaultValueProp,
    ...elementProps
  } = componentProps;
  const direction = (0,_direction_provider_DirectionContext_js__WEBPACK_IMPORTED_MODULE_6__.useDirection)();
  if (true) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    (0,_base_ui_components_utils_useIsoLayoutEffect__WEBPACK_IMPORTED_MODULE_3__.useIsoLayoutEffect)(() => {
      if (hiddenUntilFoundProp && keepMountedProp === false) {
        (0,_base_ui_components_utils_warn__WEBPACK_IMPORTED_MODULE_4__.warn)('The `keepMounted={false}` prop on a Accordion.Root will be ignored when using `hiddenUntilFound` since it requires Panels to remain mounted when closed.');
      }
    }, [hiddenUntilFoundProp, keepMountedProp]);
  }

  // memoized to allow omitting both defaultValue and value
  // which would otherwise trigger a warning in useControlled
  const defaultValue = react__WEBPACK_IMPORTED_MODULE_0__.useMemo(() => {
    if (valueProp === undefined) {
      return defaultValueProp ?? [];
    }
    return undefined;
  }, [valueProp, defaultValueProp]);
  const onValueChange = (0,_base_ui_components_utils_useEventCallback__WEBPACK_IMPORTED_MODULE_2__.useEventCallback)(onValueChangeProp);
  const accordionItemRefs = react__WEBPACK_IMPORTED_MODULE_0__.useRef([]);
  const [value, setValue] = (0,_base_ui_components_utils_useControlled__WEBPACK_IMPORTED_MODULE_1__.useControlled)({
    controlled: valueProp,
    default: defaultValue,
    name: 'Accordion',
    state: 'value'
  });
  const handleValueChange = react__WEBPACK_IMPORTED_MODULE_0__.useCallback((newValue, nextOpen) => {
    if (!openMultiple) {
      const nextValue = value[0] === newValue ? [] : [newValue];
      setValue(nextValue);
      onValueChange(nextValue);
    } else if (nextOpen) {
      const nextOpenValues = value.slice();
      nextOpenValues.push(newValue);
      setValue(nextOpenValues);
      onValueChange(nextOpenValues);
    } else {
      const nextOpenValues = value.filter(v => v !== newValue);
      setValue(nextOpenValues);
      onValueChange(nextOpenValues);
    }
  }, [onValueChange, openMultiple, setValue, value]);
  const state = react__WEBPACK_IMPORTED_MODULE_0__.useMemo(() => ({
    value,
    disabled,
    orientation
  }), [value, disabled, orientation]);
  const contextValue = react__WEBPACK_IMPORTED_MODULE_0__.useMemo(() => ({
    accordionItemRefs,
    direction,
    disabled,
    handleValueChange,
    hiddenUntilFound: hiddenUntilFoundProp ?? false,
    keepMounted: keepMountedProp ?? false,
    loop,
    orientation,
    state,
    value
  }), [direction, disabled, handleValueChange, hiddenUntilFoundProp, keepMountedProp, loop, orientation, state, value]);
  const element = (0,_utils_useRenderElement_js__WEBPACK_IMPORTED_MODULE_8__.useRenderElement)('div', componentProps, {
    state,
    ref: forwardedRef,
    props: [{
      dir: direction,
      role: 'region'
    }, elementProps],
    customStyleHookMapping: rootStyleHookMapping
  });
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)(_AccordionRootContext_js__WEBPACK_IMPORTED_MODULE_7__.AccordionRootContext.Provider, {
    value: contextValue,
    children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)(_composite_list_CompositeList_js__WEBPACK_IMPORTED_MODULE_5__.CompositeList, {
      elementsRef: accordionItemRefs,
      children: element
    })
  });
});
if (true) AccordionRoot.displayName = "AccordionRoot";

/***/ }),

/***/ "./node_modules/@base-ui-components/react/esm/accordion/root/AccordionRootContext.js":
/*!*******************************************************************************************!*\
  !*** ./node_modules/@base-ui-components/react/esm/accordion/root/AccordionRootContext.js ***!
  \*******************************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AccordionRootContext: () => (/* binding */ AccordionRootContext),
/* harmony export */   useAccordionRootContext: () => (/* binding */ useAccordionRootContext)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
'use client';


const AccordionRootContext = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createContext(undefined);
if (true) AccordionRootContext.displayName = "AccordionRootContext";
function useAccordionRootContext() {
  const context = react__WEBPACK_IMPORTED_MODULE_0__.useContext(AccordionRootContext);
  if (context === undefined) {
    throw new Error('Base UI: AccordionRootContext is missing. Accordion parts must be placed within <Accordion.Root>.');
  }
  return context;
}

/***/ }),

/***/ "./node_modules/@base-ui-components/react/esm/accordion/root/AccordionRootDataAttributes.js":
/*!**************************************************************************************************!*\
  !*** ./node_modules/@base-ui-components/react/esm/accordion/root/AccordionRootDataAttributes.js ***!
  \**************************************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AccordionRootDataAttributes: () => (/* binding */ AccordionRootDataAttributes)
/* harmony export */ });
let AccordionRootDataAttributes = /*#__PURE__*/function (AccordionRootDataAttributes) {
  /**
   * Present when the accordion is disabled.
   */
  AccordionRootDataAttributes["disabled"] = "data-disabled";
  /**
   * Indicates the orientation of the accordion.
   */
  AccordionRootDataAttributes["orientation"] = "data-orientation";
  return AccordionRootDataAttributes;
}({});

/***/ }),

/***/ "./node_modules/@base-ui-components/react/esm/accordion/trigger/AccordionTrigger.js":
/*!******************************************************************************************!*\
  !*** ./node_modules/@base-ui-components/react/esm/accordion/trigger/AccordionTrigger.js ***!
  \******************************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AccordionTrigger: () => (/* binding */ AccordionTrigger)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var _base_ui_components_utils_isElementDisabled__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @base-ui-components/utils/isElementDisabled */ "./node_modules/@base-ui-components/utils/esm/isElementDisabled.js");
/* harmony import */ var _base_ui_components_utils_useIsoLayoutEffect__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @base-ui-components/utils/useIsoLayoutEffect */ "./node_modules/@base-ui-components/utils/esm/useIsoLayoutEffect.js");
/* harmony import */ var _utils_collapsibleOpenStateMapping_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../utils/collapsibleOpenStateMapping.js */ "./node_modules/@base-ui-components/react/esm/utils/collapsibleOpenStateMapping.js");
/* harmony import */ var _use_button_index_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../use-button/index.js */ "./node_modules/@base-ui-components/react/esm/use-button/useButton.js");
/* harmony import */ var _collapsible_root_CollapsibleRootContext_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../collapsible/root/CollapsibleRootContext.js */ "./node_modules/@base-ui-components/react/esm/collapsible/root/CollapsibleRootContext.js");
/* harmony import */ var _composite_composite_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../composite/composite.js */ "./node_modules/@base-ui-components/react/esm/composite/composite.js");
/* harmony import */ var _composite_composite_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../composite/composite.js */ "./node_modules/@base-ui-components/react/esm/floating-ui-react/utils/event.js");
/* harmony import */ var _root_AccordionRootContext_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../root/AccordionRootContext.js */ "./node_modules/@base-ui-components/react/esm/accordion/root/AccordionRootContext.js");
/* harmony import */ var _item_AccordionItemContext_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../item/AccordionItemContext.js */ "./node_modules/@base-ui-components/react/esm/accordion/item/AccordionItemContext.js");
/* harmony import */ var _utils_useRenderElement_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../../utils/useRenderElement.js */ "./node_modules/@base-ui-components/react/esm/utils/useRenderElement.js");
'use client';











const SUPPORTED_KEYS = new Set([_composite_composite_js__WEBPACK_IMPORTED_MODULE_6__.ARROW_DOWN, _composite_composite_js__WEBPACK_IMPORTED_MODULE_6__.ARROW_UP, _composite_composite_js__WEBPACK_IMPORTED_MODULE_6__.ARROW_RIGHT, _composite_composite_js__WEBPACK_IMPORTED_MODULE_6__.ARROW_LEFT, _composite_composite_js__WEBPACK_IMPORTED_MODULE_6__.HOME, _composite_composite_js__WEBPACK_IMPORTED_MODULE_6__.END]);
function getActiveTriggers(accordionItemRefs) {
  const {
    current: accordionItemElements
  } = accordionItemRefs;
  const output = [];
  for (let i = 0; i < accordionItemElements.length; i += 1) {
    const section = accordionItemElements[i];
    if (!(0,_base_ui_components_utils_isElementDisabled__WEBPACK_IMPORTED_MODULE_1__.isElementDisabled)(section)) {
      const trigger = section?.querySelector('[type="button"]');
      if (!(0,_base_ui_components_utils_isElementDisabled__WEBPACK_IMPORTED_MODULE_1__.isElementDisabled)(trigger)) {
        output.push(trigger);
      }
    }
  }
  return output;
}

/**
 * A button that opens and closes the corresponding panel.
 * Renders a `<button>` element.
 *
 * Documentation: [Base UI Accordion](https://base-ui.com/react/components/accordion)
 */

const AccordionTrigger = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.forwardRef(function AccordionTrigger(componentProps, forwardedRef) {
  const {
    disabled: disabledProp,
    className,
    id: idProp,
    render,
    nativeButton = true,
    ...elementProps
  } = componentProps;
  const {
    panelId,
    open,
    handleTrigger,
    disabled: contextDisabled
  } = (0,_collapsible_root_CollapsibleRootContext_js__WEBPACK_IMPORTED_MODULE_5__.useCollapsibleRootContext)();
  const disabled = disabledProp ?? contextDisabled;
  const {
    getButtonProps,
    buttonRef
  } = (0,_use_button_index_js__WEBPACK_IMPORTED_MODULE_4__.useButton)({
    disabled,
    focusableWhenDisabled: true,
    native: nativeButton
  });
  const {
    accordionItemRefs,
    direction,
    loop,
    orientation
  } = (0,_root_AccordionRootContext_js__WEBPACK_IMPORTED_MODULE_8__.useAccordionRootContext)();
  const isRtl = direction === 'rtl';
  const isHorizontal = orientation === 'horizontal';
  const {
    state,
    setTriggerId,
    triggerId: id
  } = (0,_item_AccordionItemContext_js__WEBPACK_IMPORTED_MODULE_9__.useAccordionItemContext)();
  (0,_base_ui_components_utils_useIsoLayoutEffect__WEBPACK_IMPORTED_MODULE_2__.useIsoLayoutEffect)(() => {
    if (idProp) {
      setTriggerId(idProp);
    }
    return () => {
      setTriggerId(undefined);
    };
  }, [idProp, setTriggerId]);
  const props = react__WEBPACK_IMPORTED_MODULE_0__.useMemo(() => ({
    'aria-controls': open ? panelId : undefined,
    'aria-expanded': open,
    disabled,
    id,
    onClick: handleTrigger,
    onKeyDown(event) {
      if (!SUPPORTED_KEYS.has(event.key)) {
        return;
      }
      (0,_composite_composite_js__WEBPACK_IMPORTED_MODULE_7__.stopEvent)(event);
      const triggers = getActiveTriggers(accordionItemRefs);
      const numOfEnabledTriggers = triggers.length;
      const lastIndex = numOfEnabledTriggers - 1;
      let nextIndex = -1;
      const thisIndex = triggers.indexOf(event.target);
      function toNext() {
        if (loop) {
          nextIndex = thisIndex + 1 > lastIndex ? 0 : thisIndex + 1;
        } else {
          nextIndex = Math.min(thisIndex + 1, lastIndex);
        }
      }
      function toPrev() {
        if (loop) {
          nextIndex = thisIndex === 0 ? lastIndex : thisIndex - 1;
        } else {
          nextIndex = thisIndex - 1;
        }
      }
      switch (event.key) {
        case _composite_composite_js__WEBPACK_IMPORTED_MODULE_6__.ARROW_DOWN:
          if (!isHorizontal) {
            toNext();
          }
          break;
        case _composite_composite_js__WEBPACK_IMPORTED_MODULE_6__.ARROW_UP:
          if (!isHorizontal) {
            toPrev();
          }
          break;
        case _composite_composite_js__WEBPACK_IMPORTED_MODULE_6__.ARROW_RIGHT:
          if (isHorizontal) {
            if (isRtl) {
              toPrev();
            } else {
              toNext();
            }
          }
          break;
        case _composite_composite_js__WEBPACK_IMPORTED_MODULE_6__.ARROW_LEFT:
          if (isHorizontal) {
            if (isRtl) {
              toNext();
            } else {
              toPrev();
            }
          }
          break;
        case 'Home':
          nextIndex = 0;
          break;
        case 'End':
          nextIndex = lastIndex;
          break;
        default:
          break;
      }
      if (nextIndex > -1) {
        triggers[nextIndex].focus();
      }
    }
  }), [accordionItemRefs, disabled, handleTrigger, id, isHorizontal, isRtl, loop, open, panelId]);
  const element = (0,_utils_useRenderElement_js__WEBPACK_IMPORTED_MODULE_10__.useRenderElement)('button', componentProps, {
    state,
    ref: [forwardedRef, buttonRef],
    props: [props, elementProps, getButtonProps],
    customStyleHookMapping: _utils_collapsibleOpenStateMapping_js__WEBPACK_IMPORTED_MODULE_3__.triggerOpenStateMapping
  });
  return element;
});
if (true) AccordionTrigger.displayName = "AccordionTrigger";

/***/ }),

/***/ "./node_modules/@base-ui-components/react/esm/collapsible/panel/CollapsiblePanelDataAttributes.js":
/*!********************************************************************************************************!*\
  !*** ./node_modules/@base-ui-components/react/esm/collapsible/panel/CollapsiblePanelDataAttributes.js ***!
  \********************************************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   CollapsiblePanelDataAttributes: () => (/* binding */ CollapsiblePanelDataAttributes)
/* harmony export */ });
/* harmony import */ var _utils_styleHookMapping_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../utils/styleHookMapping.js */ "./node_modules/@base-ui-components/react/esm/utils/styleHookMapping.js");

let CollapsiblePanelDataAttributes = function (CollapsiblePanelDataAttributes) {
  /**
   * Present when the collapsible panel is open.
   */
  CollapsiblePanelDataAttributes["open"] = "data-open";
  /**
   * Present when the collapsible panel is closed.
   */
  CollapsiblePanelDataAttributes["closed"] = "data-closed";
  /**
   * Present when the panel is animating in.
   */
  CollapsiblePanelDataAttributes[CollapsiblePanelDataAttributes["startingStyle"] = _utils_styleHookMapping_js__WEBPACK_IMPORTED_MODULE_0__.TransitionStatusDataAttributes.startingStyle] = "startingStyle";
  /**
   * Present when the panel is animating out.
   */
  CollapsiblePanelDataAttributes[CollapsiblePanelDataAttributes["endingStyle"] = _utils_styleHookMapping_js__WEBPACK_IMPORTED_MODULE_0__.TransitionStatusDataAttributes.endingStyle] = "endingStyle";
  return CollapsiblePanelDataAttributes;
}({});

/***/ }),

/***/ "./node_modules/@base-ui-components/react/esm/collapsible/panel/useCollapsiblePanel.js":
/*!*********************************************************************************************!*\
  !*** ./node_modules/@base-ui-components/react/esm/collapsible/panel/useCollapsiblePanel.js ***!
  \*********************************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   useCollapsiblePanel: () => (/* binding */ useCollapsiblePanel)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var _base_ui_components_utils_useIsoLayoutEffect__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @base-ui-components/utils/useIsoLayoutEffect */ "./node_modules/@base-ui-components/utils/esm/useIsoLayoutEffect.js");
/* harmony import */ var _base_ui_components_utils_useEventCallback__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @base-ui-components/utils/useEventCallback */ "./node_modules/@base-ui-components/utils/esm/useEventCallback.js");
/* harmony import */ var _base_ui_components_utils_useMergedRefs__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @base-ui-components/utils/useMergedRefs */ "./node_modules/@base-ui-components/utils/esm/useMergedRefs.js");
/* harmony import */ var _base_ui_components_utils_useOnMount__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @base-ui-components/utils/useOnMount */ "./node_modules/@base-ui-components/utils/esm/useOnMount.js");
/* harmony import */ var _base_ui_components_utils_useAnimationFrame__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @base-ui-components/utils/useAnimationFrame */ "./node_modules/@base-ui-components/utils/esm/useAnimationFrame.js");
/* harmony import */ var _base_ui_components_utils_warn__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @base-ui-components/utils/warn */ "./node_modules/@base-ui-components/utils/esm/warn.js");
/* harmony import */ var _CollapsiblePanelDataAttributes_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./CollapsiblePanelDataAttributes.js */ "./node_modules/@base-ui-components/react/esm/collapsible/panel/CollapsiblePanelDataAttributes.js");
/* harmony import */ var _accordion_root_AccordionRootDataAttributes_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../../accordion/root/AccordionRootDataAttributes.js */ "./node_modules/@base-ui-components/react/esm/accordion/root/AccordionRootDataAttributes.js");
'use client';










function useCollapsiblePanel(parameters) {
  const {
    abortControllerRef,
    animationTypeRef,
    externalRef,
    height,
    hiddenUntilFound,
    keepMounted,
    id: idParam,
    mounted,
    onOpenChange,
    open,
    panelRef,
    runOnceAnimationsFinish,
    setDimensions,
    setMounted,
    setOpen,
    setVisible,
    transitionDimensionRef,
    visible,
    width
  } = parameters;
  const isBeforeMatchRef = react__WEBPACK_IMPORTED_MODULE_0__.useRef(false);
  const latestAnimationNameRef = react__WEBPACK_IMPORTED_MODULE_0__.useRef(null);
  const shouldCancelInitialOpenAnimationRef = react__WEBPACK_IMPORTED_MODULE_0__.useRef(open);
  const shouldCancelInitialOpenTransitionRef = react__WEBPACK_IMPORTED_MODULE_0__.useRef(open);

  /**
   * When opening, the `hidden` attribute is removed immediately.
   * When closing, the `hidden` attribute is set after any exit animations runs.
   */
  const hidden = react__WEBPACK_IMPORTED_MODULE_0__.useMemo(() => {
    if (animationTypeRef.current === 'css-animation') {
      return !visible;
    }
    return !open && !mounted;
  }, [open, mounted, visible, animationTypeRef]);

  /**
   * When `keepMounted` is `true` this runs once as soon as it exists in the DOM
   * regardless of initial open state.
   *
   * When `keepMounted` is `false` this runs on every mount, typically every
   * time it opens. If the panel is in the middle of a close transition that is
   * interrupted and re-opens, this won't run as the panel was not unmounted.
   */
  const handlePanelRef = (0,_base_ui_components_utils_useEventCallback__WEBPACK_IMPORTED_MODULE_2__.useEventCallback)(element => {
    if (!element) {
      return undefined;
    }
    if (animationTypeRef.current == null || transitionDimensionRef.current == null) {
      const panelStyles = getComputedStyle(element);
      const hasAnimation = panelStyles.animationName !== 'none' && panelStyles.animationName !== '';
      const hasTransition = panelStyles.transitionDuration !== '0s' && panelStyles.transitionDuration !== '';

      /**
       * animationTypeRef is safe to read in render because it's only ever set
       * once here during the first render and never again.
       * https://react.dev/learn/referencing-values-with-refs#best-practices-for-refs
       */
      if (hasAnimation && hasTransition) {
        if (true) {
          (0,_base_ui_components_utils_warn__WEBPACK_IMPORTED_MODULE_6__.warn)('CSS transitions and CSS animations both detected on Collapsible or Accordion panel.', 'Only one of either animation type should be used.');
        }
      } else if (panelStyles.animationName === 'none' && panelStyles.transitionDuration !== '0s') {
        animationTypeRef.current = 'css-transition';
      } else if (panelStyles.animationName !== 'none' && panelStyles.transitionDuration === '0s') {
        animationTypeRef.current = 'css-animation';
      } else {
        animationTypeRef.current = 'none';
      }

      /**
       * We need to know in advance which side is being collapsed when using CSS
       * transitions in order to set the value of width/height to `0px` momentarily.
       * Setting both to `0px` will break layout.
       */
      if (element.getAttribute(_accordion_root_AccordionRootDataAttributes_js__WEBPACK_IMPORTED_MODULE_8__.AccordionRootDataAttributes.orientation) === 'horizontal' || panelStyles.transitionProperty.indexOf('width') > -1) {
        transitionDimensionRef.current = 'width';
      } else {
        transitionDimensionRef.current = 'height';
      }
    }
    if (animationTypeRef.current !== 'css-transition') {
      return undefined;
    }

    /**
     * Explicitly set `display` to ensure the panel is actually rendered before
     * measuring anything. `!important` is to needed to override a conflicting
     * Tailwind v4 default that sets `display: none !important` on `[hidden]`:
     * https://github.com/tailwindlabs/tailwindcss/blob/cd154a4f471e7a63cc27cad15dada650de89d52b/packages/tailwindcss/preflight.css#L320-L326
     */
    element.style.setProperty('display', 'block', 'important');
    if (height === undefined || width === undefined) {
      setDimensions({
        height: element.scrollHeight,
        width: element.scrollWidth
      });
      element.style.removeProperty('display');
      if (shouldCancelInitialOpenTransitionRef.current) {
        element.style.setProperty('transition-duration', '0s');
      }
    }
    let frame = -1;
    let nextFrame = -1;
    frame = _base_ui_components_utils_useAnimationFrame__WEBPACK_IMPORTED_MODULE_5__.AnimationFrame.request(() => {
      shouldCancelInitialOpenTransitionRef.current = false;
      nextFrame = _base_ui_components_utils_useAnimationFrame__WEBPACK_IMPORTED_MODULE_5__.AnimationFrame.request(() => {
        /**
         * This is slightly faster than another RAF and is the earliest
         * opportunity to remove the temporary `transition-duration: 0s` that
         * was applied to cancel opening transitions of initially open panels.
         * https://nolanlawson.com/2018/09/25/accurately-measuring-layout-on-the-web/
         */
        setTimeout(() => {
          element.style.removeProperty('transition-duration');
        });
      });
    });
    return () => {
      _base_ui_components_utils_useAnimationFrame__WEBPACK_IMPORTED_MODULE_5__.AnimationFrame.cancel(frame);
      _base_ui_components_utils_useAnimationFrame__WEBPACK_IMPORTED_MODULE_5__.AnimationFrame.cancel(nextFrame);
    };
  });
  const mergedPanelRef = (0,_base_ui_components_utils_useMergedRefs__WEBPACK_IMPORTED_MODULE_3__.useMergedRefs)(externalRef, panelRef, handlePanelRef);
  (0,_base_ui_components_utils_useIsoLayoutEffect__WEBPACK_IMPORTED_MODULE_1__.useIsoLayoutEffect)(() => {
    if (animationTypeRef.current !== 'css-transition') {
      return undefined;
    }
    const panel = panelRef.current;
    if (!panel) {
      return undefined;
    }
    let resizeFrame = -1;
    if (abortControllerRef.current != null) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    if (open) {
      /* opening */
      panel.style.setProperty('display', 'block', 'important');

      /**
       * When `keepMounted={false}` and the panel is initially closed, the very
       * first time it opens (not any subsequent opens) `data-starting-style` is
       * off or missing by a frame so we need to set it manually. Otherwise any
       * CSS properties expected to transition using [data-starting-style] may
       * be mis-timed and appear to be complete skipped.
       */
      if (!shouldCancelInitialOpenTransitionRef.current && !keepMounted) {
        panel.setAttribute(_CollapsiblePanelDataAttributes_js__WEBPACK_IMPORTED_MODULE_7__.CollapsiblePanelDataAttributes.startingStyle, '');
      }
      setDimensions({
        height: panel.scrollHeight,
        width: panel.scrollWidth
      });
      resizeFrame = _base_ui_components_utils_useAnimationFrame__WEBPACK_IMPORTED_MODULE_5__.AnimationFrame.request(() => {
        panel.style.removeProperty('display');
      });
    } else {
      /* closing */
      setDimensions({
        height: panel.scrollHeight,
        width: panel.scrollWidth
      });
      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;
      let frame2 = -1;
      const frame1 = _base_ui_components_utils_useAnimationFrame__WEBPACK_IMPORTED_MODULE_5__.AnimationFrame.request(() => {
        // Wait until the `[data-ending-style]` attribute is added.
        frame2 = _base_ui_components_utils_useAnimationFrame__WEBPACK_IMPORTED_MODULE_5__.AnimationFrame.request(() => {
          runOnceAnimationsFinish(() => {
            setDimensions({
              height: 0,
              width: 0
            });
            panel.style.removeProperty('content-visibility');
            panel.style.removeProperty('display');
            setMounted(false);
            abortControllerRef.current = null;
          }, signal);
        });
      });
      return () => {
        _base_ui_components_utils_useAnimationFrame__WEBPACK_IMPORTED_MODULE_5__.AnimationFrame.cancel(frame1);
        _base_ui_components_utils_useAnimationFrame__WEBPACK_IMPORTED_MODULE_5__.AnimationFrame.cancel(frame2);
      };
    }
    return () => {
      _base_ui_components_utils_useAnimationFrame__WEBPACK_IMPORTED_MODULE_5__.AnimationFrame.cancel(resizeFrame);
    };
  }, [abortControllerRef, animationTypeRef, hiddenUntilFound, keepMounted, mounted, open, panelRef, runOnceAnimationsFinish, setDimensions, setMounted, transitionDimensionRef]);
  (0,_base_ui_components_utils_useIsoLayoutEffect__WEBPACK_IMPORTED_MODULE_1__.useIsoLayoutEffect)(() => {
    if (animationTypeRef.current !== 'css-animation') {
      return;
    }
    const panel = panelRef.current;
    if (!panel) {
      return;
    }
    latestAnimationNameRef.current = panel.style.animationName || latestAnimationNameRef.current;
    panel.style.setProperty('animation-name', 'none');
    setDimensions({
      height: panel.scrollHeight,
      width: panel.scrollWidth
    });
    if (!shouldCancelInitialOpenAnimationRef.current && !isBeforeMatchRef.current) {
      panel.style.removeProperty('animation-name');
    }
    if (open) {
      if (abortControllerRef.current != null) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
      setMounted(true);
      setVisible(true);
    } else {
      abortControllerRef.current = new AbortController();
      runOnceAnimationsFinish(() => {
        setMounted(false);
        setVisible(false);
        abortControllerRef.current = null;
      }, abortControllerRef.current.signal);
    }
  }, [abortControllerRef, animationTypeRef, open, panelRef, runOnceAnimationsFinish, setDimensions, setMounted, setVisible, visible]);
  (0,_base_ui_components_utils_useOnMount__WEBPACK_IMPORTED_MODULE_4__.useOnMount)(() => {
    const frame = _base_ui_components_utils_useAnimationFrame__WEBPACK_IMPORTED_MODULE_5__.AnimationFrame.request(() => {
      shouldCancelInitialOpenAnimationRef.current = false;
    });
    return () => _base_ui_components_utils_useAnimationFrame__WEBPACK_IMPORTED_MODULE_5__.AnimationFrame.cancel(frame);
  });
  (0,_base_ui_components_utils_useIsoLayoutEffect__WEBPACK_IMPORTED_MODULE_1__.useIsoLayoutEffect)(() => {
    if (!hiddenUntilFound) {
      return undefined;
    }
    const panel = panelRef.current;
    if (!panel) {
      return undefined;
    }
    let frame = -1;
    let nextFrame = -1;
    if (open && isBeforeMatchRef.current) {
      panel.style.transitionDuration = '0s';
      setDimensions({
        height: panel.scrollHeight,
        width: panel.scrollWidth
      });
      frame = _base_ui_components_utils_useAnimationFrame__WEBPACK_IMPORTED_MODULE_5__.AnimationFrame.request(() => {
        isBeforeMatchRef.current = false;
        nextFrame = _base_ui_components_utils_useAnimationFrame__WEBPACK_IMPORTED_MODULE_5__.AnimationFrame.request(() => {
          setTimeout(() => {
            panel.style.removeProperty('transition-duration');
          });
        });
      });
    }
    return () => {
      _base_ui_components_utils_useAnimationFrame__WEBPACK_IMPORTED_MODULE_5__.AnimationFrame.cancel(frame);
      _base_ui_components_utils_useAnimationFrame__WEBPACK_IMPORTED_MODULE_5__.AnimationFrame.cancel(nextFrame);
    };
  }, [hiddenUntilFound, open, panelRef, setDimensions]);
  (0,_base_ui_components_utils_useIsoLayoutEffect__WEBPACK_IMPORTED_MODULE_1__.useIsoLayoutEffect)(() => {
    const panel = panelRef.current;
    if (panel && hiddenUntilFound && hidden) {
      /**
       * React only supports a boolean for the `hidden` attribute and forces
       * legit string values to booleans so we have to force it back in the DOM
       * when necessary: https://github.com/facebook/react/issues/24740
       */
      panel.setAttribute('hidden', 'until-found');
      /**
       * Set data-starting-style here to persist the closed styles, this is to
       * prevent transitions from starting when the `hidden` attribute changes
       * to `'until-found'` as they could have different `display` properties:
       * https://github.com/tailwindlabs/tailwindcss/pull/14625
       */
      if (animationTypeRef.current === 'css-transition') {
        panel.setAttribute(_CollapsiblePanelDataAttributes_js__WEBPACK_IMPORTED_MODULE_7__.CollapsiblePanelDataAttributes.startingStyle, '');
      }
    }
  }, [hiddenUntilFound, hidden, animationTypeRef, panelRef]);
  react__WEBPACK_IMPORTED_MODULE_0__.useEffect(function registerBeforeMatchListener() {
    const panel = panelRef.current;
    if (!panel) {
      return undefined;
    }
    function handleBeforeMatch() {
      isBeforeMatchRef.current = true;
      setOpen(true);
      onOpenChange(true);
    }
    panel.addEventListener('beforematch', handleBeforeMatch);
    return () => {
      panel.removeEventListener('beforematch', handleBeforeMatch);
    };
  }, [onOpenChange, panelRef, setOpen]);
  return react__WEBPACK_IMPORTED_MODULE_0__.useMemo(() => ({
    props: {
      hidden,
      id: idParam,
      ref: mergedPanelRef
    }
  }), [hidden, idParam, mergedPanelRef]);
}

/***/ }),

/***/ "./node_modules/@base-ui-components/react/esm/collapsible/root/CollapsibleRootContext.js":
/*!***********************************************************************************************!*\
  !*** ./node_modules/@base-ui-components/react/esm/collapsible/root/CollapsibleRootContext.js ***!
  \***********************************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   CollapsibleRootContext: () => (/* binding */ CollapsibleRootContext),
/* harmony export */   useCollapsibleRootContext: () => (/* binding */ useCollapsibleRootContext)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
'use client';


const CollapsibleRootContext = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createContext(undefined);
if (true) CollapsibleRootContext.displayName = "CollapsibleRootContext";
function useCollapsibleRootContext() {
  const context = react__WEBPACK_IMPORTED_MODULE_0__.useContext(CollapsibleRootContext);
  if (context === undefined) {
    throw new Error('Base UI: CollapsibleRootContext is missing. Collapsible parts must be placed within <Collapsible.Root>.');
  }
  return context;
}

/***/ }),

/***/ "./node_modules/@base-ui-components/react/esm/collapsible/root/useCollapsibleRoot.js":
/*!*******************************************************************************************!*\
  !*** ./node_modules/@base-ui-components/react/esm/collapsible/root/useCollapsibleRoot.js ***!
  \*******************************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   useCollapsibleRoot: () => (/* binding */ useCollapsibleRoot)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var _base_ui_components_utils_useControlled__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @base-ui-components/utils/useControlled */ "./node_modules/@base-ui-components/utils/esm/useControlled.js");
/* harmony import */ var _base_ui_components_utils_useIsoLayoutEffect__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @base-ui-components/utils/useIsoLayoutEffect */ "./node_modules/@base-ui-components/utils/esm/useIsoLayoutEffect.js");
/* harmony import */ var _base_ui_components_utils_useEventCallback__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @base-ui-components/utils/useEventCallback */ "./node_modules/@base-ui-components/utils/esm/useEventCallback.js");
/* harmony import */ var _utils_useBaseUiId_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../utils/useBaseUiId.js */ "./node_modules/@base-ui-components/react/esm/utils/useBaseUiId.js");
/* harmony import */ var _utils_useAnimationsFinished_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../utils/useAnimationsFinished.js */ "./node_modules/@base-ui-components/react/esm/utils/useAnimationsFinished.js");
/* harmony import */ var _utils_useTransitionStatus_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../utils/useTransitionStatus.js */ "./node_modules/@base-ui-components/react/esm/utils/useTransitionStatus.js");
'use client';








function useCollapsibleRoot(parameters) {
  const {
    open: openParam,
    defaultOpen,
    onOpenChange,
    disabled
  } = parameters;
  const isControlled = openParam !== undefined;
  const [open, setOpen] = (0,_base_ui_components_utils_useControlled__WEBPACK_IMPORTED_MODULE_1__.useControlled)({
    controlled: openParam,
    default: defaultOpen,
    name: 'Collapsible',
    state: 'open'
  });
  const {
    mounted,
    setMounted,
    transitionStatus
  } = (0,_utils_useTransitionStatus_js__WEBPACK_IMPORTED_MODULE_6__.useTransitionStatus)(open, true, true);
  const [visible, setVisible] = react__WEBPACK_IMPORTED_MODULE_0__.useState(open);
  const [{
    height,
    width
  }, setDimensions] = react__WEBPACK_IMPORTED_MODULE_0__.useState({
    height: undefined,
    width: undefined
  });
  const defaultPanelId = (0,_utils_useBaseUiId_js__WEBPACK_IMPORTED_MODULE_4__.useBaseUiId)();
  const [panelIdState, setPanelIdState] = react__WEBPACK_IMPORTED_MODULE_0__.useState();
  const panelId = panelIdState ?? defaultPanelId;
  const [hiddenUntilFound, setHiddenUntilFound] = react__WEBPACK_IMPORTED_MODULE_0__.useState(false);
  const [keepMounted, setKeepMounted] = react__WEBPACK_IMPORTED_MODULE_0__.useState(false);
  const abortControllerRef = react__WEBPACK_IMPORTED_MODULE_0__.useRef(null);
  const animationTypeRef = react__WEBPACK_IMPORTED_MODULE_0__.useRef(null);
  const transitionDimensionRef = react__WEBPACK_IMPORTED_MODULE_0__.useRef(null);
  const panelRef = react__WEBPACK_IMPORTED_MODULE_0__.useRef(null);
  const runOnceAnimationsFinish = (0,_utils_useAnimationsFinished_js__WEBPACK_IMPORTED_MODULE_5__.useAnimationsFinished)(panelRef, false);
  const handleTrigger = (0,_base_ui_components_utils_useEventCallback__WEBPACK_IMPORTED_MODULE_3__.useEventCallback)(() => {
    const nextOpen = !open;
    const panel = panelRef.current;
    if (animationTypeRef.current === 'css-animation' && panel != null) {
      panel.style.removeProperty('animation-name');
    }
    if (!hiddenUntilFound && !keepMounted) {
      if (animationTypeRef.current != null && animationTypeRef.current !== 'css-animation') {
        if (!mounted && nextOpen) {
          setMounted(true);
        }
      }
      if (animationTypeRef.current === 'css-animation') {
        if (!visible && nextOpen) {
          setVisible(true);
        }
        if (!mounted && nextOpen) {
          setMounted(true);
        }
      }
    }
    setOpen(nextOpen);
    onOpenChange(nextOpen);
    if (animationTypeRef.current === 'none') {
      if (mounted && !nextOpen) {
        setMounted(false);
      }
    }
  });
  (0,_base_ui_components_utils_useIsoLayoutEffect__WEBPACK_IMPORTED_MODULE_2__.useIsoLayoutEffect)(() => {
    /**
     * Unmount immediately when closing in controlled mode and keepMounted={false}
     * and no CSS animations or transitions are applied
     */
    if (isControlled && animationTypeRef.current === 'none' && !keepMounted && !open) {
      setMounted(false);
    }
  }, [isControlled, keepMounted, open, openParam, setMounted]);
  return react__WEBPACK_IMPORTED_MODULE_0__.useMemo(() => ({
    abortControllerRef,
    animationTypeRef,
    disabled,
    handleTrigger,
    height,
    mounted,
    open,
    panelId,
    panelRef,
    runOnceAnimationsFinish,
    setDimensions,
    setHiddenUntilFound,
    setKeepMounted,
    setMounted,
    setOpen,
    setPanelIdState,
    setVisible,
    transitionDimensionRef,
    transitionStatus,
    visible,
    width
  }), [abortControllerRef, animationTypeRef, disabled, handleTrigger, height, mounted, open, panelId, panelRef, runOnceAnimationsFinish, setDimensions, setHiddenUntilFound, setKeepMounted, setMounted, setOpen, setVisible, transitionDimensionRef, transitionStatus, visible, width]);
}

/***/ }),

/***/ "./node_modules/@base-ui-components/react/esm/collapsible/trigger/CollapsibleTriggerDataAttributes.js":
/*!************************************************************************************************************!*\
  !*** ./node_modules/@base-ui-components/react/esm/collapsible/trigger/CollapsibleTriggerDataAttributes.js ***!
  \************************************************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   CollapsibleTriggerDataAttributes: () => (/* binding */ CollapsibleTriggerDataAttributes)
/* harmony export */ });
let CollapsibleTriggerDataAttributes = /*#__PURE__*/function (CollapsibleTriggerDataAttributes) {
  /**
   * Present when the collapsible panel is open.
   */
  CollapsibleTriggerDataAttributes["panelOpen"] = "data-panel-open";
  return CollapsibleTriggerDataAttributes;
}({});

/***/ }),

/***/ "./node_modules/@base-ui-components/react/esm/composite/composite.js":
/*!***************************************************************************!*\
  !*** ./node_modules/@base-ui-components/react/esm/composite/composite.js ***!
  \***************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ALL_KEYS: () => (/* binding */ ALL_KEYS),
/* harmony export */   ALT: () => (/* binding */ ALT),
/* harmony export */   ARROW_DOWN: () => (/* binding */ ARROW_DOWN),
/* harmony export */   ARROW_KEYS: () => (/* binding */ ARROW_KEYS),
/* harmony export */   ARROW_LEFT: () => (/* binding */ ARROW_LEFT),
/* harmony export */   ARROW_RIGHT: () => (/* binding */ ARROW_RIGHT),
/* harmony export */   ARROW_UP: () => (/* binding */ ARROW_UP),
/* harmony export */   COMPOSITE_KEYS: () => (/* binding */ COMPOSITE_KEYS),
/* harmony export */   CONTROL: () => (/* binding */ CONTROL),
/* harmony export */   END: () => (/* binding */ END),
/* harmony export */   HOME: () => (/* binding */ HOME),
/* harmony export */   HORIZONTAL_KEYS: () => (/* binding */ HORIZONTAL_KEYS),
/* harmony export */   HORIZONTAL_KEYS_WITH_EXTRA_KEYS: () => (/* binding */ HORIZONTAL_KEYS_WITH_EXTRA_KEYS),
/* harmony export */   META: () => (/* binding */ META),
/* harmony export */   MODIFIER_KEYS: () => (/* binding */ MODIFIER_KEYS),
/* harmony export */   SHIFT: () => (/* binding */ SHIFT),
/* harmony export */   VERTICAL_KEYS: () => (/* binding */ VERTICAL_KEYS),
/* harmony export */   VERTICAL_KEYS_WITH_EXTRA_KEYS: () => (/* binding */ VERTICAL_KEYS_WITH_EXTRA_KEYS),
/* harmony export */   createGridCellMap: () => (/* reexport safe */ _floating_ui_react_utils_js__WEBPACK_IMPORTED_MODULE_1__.createGridCellMap),
/* harmony export */   findNonDisabledListIndex: () => (/* reexport safe */ _floating_ui_react_utils_js__WEBPACK_IMPORTED_MODULE_1__.findNonDisabledListIndex),
/* harmony export */   getGridCellIndexOfCorner: () => (/* reexport safe */ _floating_ui_react_utils_js__WEBPACK_IMPORTED_MODULE_1__.getGridCellIndexOfCorner),
/* harmony export */   getGridCellIndices: () => (/* reexport safe */ _floating_ui_react_utils_js__WEBPACK_IMPORTED_MODULE_1__.getGridCellIndices),
/* harmony export */   getGridNavigatedIndex: () => (/* reexport safe */ _floating_ui_react_utils_js__WEBPACK_IMPORTED_MODULE_1__.getGridNavigatedIndex),
/* harmony export */   getMaxListIndex: () => (/* reexport safe */ _floating_ui_react_utils_js__WEBPACK_IMPORTED_MODULE_1__.getMaxListIndex),
/* harmony export */   getMinListIndex: () => (/* reexport safe */ _floating_ui_react_utils_js__WEBPACK_IMPORTED_MODULE_1__.getMinListIndex),
/* harmony export */   isIndexOutOfListBounds: () => (/* reexport safe */ _floating_ui_react_utils_js__WEBPACK_IMPORTED_MODULE_1__.isIndexOutOfListBounds),
/* harmony export */   isListIndexDisabled: () => (/* reexport safe */ _floating_ui_react_utils_js__WEBPACK_IMPORTED_MODULE_1__.isListIndexDisabled),
/* harmony export */   isNativeInput: () => (/* binding */ isNativeInput),
/* harmony export */   scrollIntoViewIfNeeded: () => (/* binding */ scrollIntoViewIfNeeded),
/* harmony export */   stopEvent: () => (/* reexport safe */ _floating_ui_react_utils_js__WEBPACK_IMPORTED_MODULE_0__.stopEvent)
/* harmony export */ });
/* harmony import */ var _floating_ui_react_utils_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../floating-ui-react/utils.js */ "./node_modules/@base-ui-components/react/esm/floating-ui-react/utils/event.js");
/* harmony import */ var _floating_ui_react_utils_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../floating-ui-react/utils.js */ "./node_modules/@base-ui-components/react/esm/floating-ui-react/utils/composite.js");

const ARROW_UP = 'ArrowUp';
const ARROW_DOWN = 'ArrowDown';
const ARROW_LEFT = 'ArrowLeft';
const ARROW_RIGHT = 'ArrowRight';
const HOME = 'Home';
const END = 'End';
const HORIZONTAL_KEYS = new Set([ARROW_LEFT, ARROW_RIGHT]);
const HORIZONTAL_KEYS_WITH_EXTRA_KEYS = new Set([ARROW_LEFT, ARROW_RIGHT, HOME, END]);
const VERTICAL_KEYS = new Set([ARROW_UP, ARROW_DOWN]);
const VERTICAL_KEYS_WITH_EXTRA_KEYS = new Set([ARROW_UP, ARROW_DOWN, HOME, END]);
const ARROW_KEYS = new Set([...HORIZONTAL_KEYS, ...VERTICAL_KEYS]);
const ALL_KEYS = new Set([...ARROW_KEYS, HOME, END]);
const COMPOSITE_KEYS = new Set([ARROW_UP, ARROW_DOWN, ARROW_LEFT, ARROW_RIGHT, HOME, END]);
const SHIFT = 'Shift';
const CONTROL = 'Control';
const ALT = 'Alt';
const META = 'Meta';
const MODIFIER_KEYS = new Set([SHIFT, CONTROL, ALT, META]);
function isNativeInput(element) {
  if (element instanceof HTMLInputElement && element.selectionStart != null) {
    return true;
  }
  if (element instanceof HTMLTextAreaElement) {
    return true;
  }
  return false;
}
function scrollIntoViewIfNeeded(scrollContainer, element, direction, orientation) {
  if (!scrollContainer || !element || !element.scrollTo) {
    return;
  }
  let targetX = scrollContainer.scrollLeft;
  let targetY = scrollContainer.scrollTop;
  const isOverflowingX = scrollContainer.clientWidth < scrollContainer.scrollWidth;
  const isOverflowingY = scrollContainer.clientHeight < scrollContainer.scrollHeight;
  if (isOverflowingX && orientation !== 'vertical') {
    const elementOffsetLeft = getOffset(scrollContainer, element, 'left');
    const containerStyles = getStyles(scrollContainer);
    const elementStyles = getStyles(element);
    if (direction === 'ltr') {
      if (elementOffsetLeft + element.offsetWidth + elementStyles.scrollMarginRight > scrollContainer.scrollLeft + scrollContainer.clientWidth - containerStyles.scrollPaddingRight) {
        // overflow to the right, scroll to align right edges
        targetX = elementOffsetLeft + element.offsetWidth + elementStyles.scrollMarginRight - scrollContainer.clientWidth + containerStyles.scrollPaddingRight;
      } else if (elementOffsetLeft - elementStyles.scrollMarginLeft < scrollContainer.scrollLeft + containerStyles.scrollPaddingLeft) {
        // overflow to the left, scroll to align left edges
        targetX = elementOffsetLeft - elementStyles.scrollMarginLeft - containerStyles.scrollPaddingLeft;
      }
    }
    if (direction === 'rtl') {
      if (elementOffsetLeft - elementStyles.scrollMarginRight < scrollContainer.scrollLeft + containerStyles.scrollPaddingLeft) {
        // overflow to the left, scroll to align left edges
        targetX = elementOffsetLeft - elementStyles.scrollMarginLeft - containerStyles.scrollPaddingLeft;
      } else if (elementOffsetLeft + element.offsetWidth + elementStyles.scrollMarginRight > scrollContainer.scrollLeft + scrollContainer.clientWidth - containerStyles.scrollPaddingRight) {
        // overflow to the right, scroll to align right edges
        targetX = elementOffsetLeft + element.offsetWidth + elementStyles.scrollMarginRight - scrollContainer.clientWidth + containerStyles.scrollPaddingRight;
      }
    }
  }
  if (isOverflowingY && orientation !== 'horizontal') {
    const elementOffsetTop = getOffset(scrollContainer, element, 'top');
    const containerStyles = getStyles(scrollContainer);
    const elementStyles = getStyles(element);
    if (elementOffsetTop - elementStyles.scrollMarginTop < scrollContainer.scrollTop + containerStyles.scrollPaddingTop) {
      // overflow upwards, align top edges
      targetY = elementOffsetTop - elementStyles.scrollMarginTop - containerStyles.scrollPaddingTop;
    } else if (elementOffsetTop + element.offsetHeight + elementStyles.scrollMarginBottom > scrollContainer.scrollTop + scrollContainer.clientHeight - containerStyles.scrollPaddingBottom) {
      // overflow downwards, align bottom edges
      targetY = elementOffsetTop + element.offsetHeight + elementStyles.scrollMarginBottom - scrollContainer.clientHeight + containerStyles.scrollPaddingBottom;
    }
  }
  scrollContainer.scrollTo({
    left: targetX,
    top: targetY,
    behavior: 'auto'
  });
}
function getOffset(ancestor, element, side) {
  const propName = side === 'left' ? 'offsetLeft' : 'offsetTop';
  let result = 0;
  while (element.offsetParent) {
    result += element[propName];
    if (element.offsetParent === ancestor) {
      break;
    }
    element = element.offsetParent;
  }
  return result;
}
function getStyles(element) {
  const styles = getComputedStyle(element);
  return {
    scrollMarginTop: parseFloat(styles.scrollMarginTop) || 0,
    scrollMarginRight: parseFloat(styles.scrollMarginRight) || 0,
    scrollMarginBottom: parseFloat(styles.scrollMarginBottom) || 0,
    scrollMarginLeft: parseFloat(styles.scrollMarginLeft) || 0,
    scrollPaddingTop: parseFloat(styles.scrollPaddingTop) || 0,
    scrollPaddingRight: parseFloat(styles.scrollPaddingRight) || 0,
    scrollPaddingBottom: parseFloat(styles.scrollPaddingBottom) || 0,
    scrollPaddingLeft: parseFloat(styles.scrollPaddingLeft) || 0
  };
}

/***/ }),

/***/ "./node_modules/@base-ui-components/react/esm/composite/list/CompositeList.js":
/*!************************************************************************************!*\
  !*** ./node_modules/@base-ui-components/react/esm/composite/list/CompositeList.js ***!
  \************************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   CompositeList: () => (/* binding */ CompositeList)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var _base_ui_components_utils_useRefWithInit__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @base-ui-components/utils/useRefWithInit */ "./node_modules/@base-ui-components/utils/esm/useRefWithInit.js");
/* harmony import */ var _base_ui_components_utils_useEventCallback__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @base-ui-components/utils/useEventCallback */ "./node_modules/@base-ui-components/utils/esm/useEventCallback.js");
/* harmony import */ var _base_ui_components_utils_useIsoLayoutEffect__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @base-ui-components/utils/useIsoLayoutEffect */ "./node_modules/@base-ui-components/utils/esm/useIsoLayoutEffect.js");
/* harmony import */ var _CompositeListContext_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./CompositeListContext.js */ "./node_modules/@base-ui-components/react/esm/composite/list/CompositeListContext.js");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* eslint-disable no-bitwise */
'use client';







/**
 * Provides context for a list of items in a composite component.
 * @internal
 */
function CompositeList(props) {
  const {
    children,
    elementsRef,
    labelsRef,
    onMapChange
  } = props;
  const nextIndexRef = react__WEBPACK_IMPORTED_MODULE_0__.useRef(0);
  const listeners = (0,_base_ui_components_utils_useRefWithInit__WEBPACK_IMPORTED_MODULE_1__.useRefWithInit)(createListeners).current;

  // We use a stable `map` to avoid O(n^2) re-allocation costs for large lists.
  // `mapTick` is our re-render trigger mechanism. We also need to update the
  // elements and label refs, but there's a lot of async work going on and sometimes
  // the effect that handles `onMapChange` gets called after those refs have been
  // filled, and we don't want to lose those values by setting their lengths to `0`.
  // We also need to have them at the proper length because floating-ui uses that
  // information for list navigation.

  const map = (0,_base_ui_components_utils_useRefWithInit__WEBPACK_IMPORTED_MODULE_1__.useRefWithInit)(createMap).current;
  const [mapTick, setMapTick] = react__WEBPACK_IMPORTED_MODULE_0__.useState(0);
  const lastTickRef = react__WEBPACK_IMPORTED_MODULE_0__.useRef(mapTick);
  const register = (0,_base_ui_components_utils_useEventCallback__WEBPACK_IMPORTED_MODULE_2__.useEventCallback)((node, metadata) => {
    map.set(node, metadata ?? null);
    lastTickRef.current += 1;
    setMapTick(lastTickRef.current);
  });
  const unregister = (0,_base_ui_components_utils_useEventCallback__WEBPACK_IMPORTED_MODULE_2__.useEventCallback)(node => {
    map.delete(node);
    lastTickRef.current += 1;
    setMapTick(lastTickRef.current);
  });
  const sortedMap = react__WEBPACK_IMPORTED_MODULE_0__.useMemo(() => {
    // `mapTick` is the `useMemo` trigger as `map` is stable.
    disableEslintWarning(mapTick);
    const newMap = new Map();
    const sortedNodes = Array.from(map.keys()).sort(sortByDocumentPosition);
    sortedNodes.forEach((node, index) => {
      const metadata = map.get(node) ?? {};
      newMap.set(node, {
        ...metadata,
        index
      });
    });
    return newMap;
  }, [map, mapTick]);
  (0,_base_ui_components_utils_useIsoLayoutEffect__WEBPACK_IMPORTED_MODULE_3__.useIsoLayoutEffect)(() => {
    const shouldUpdateLengths = lastTickRef.current === mapTick;
    if (shouldUpdateLengths) {
      if (elementsRef.current.length !== sortedMap.size) {
        elementsRef.current.length = sortedMap.size;
      }
      if (labelsRef && labelsRef.current.length !== sortedMap.size) {
        labelsRef.current.length = sortedMap.size;
      }
    }
    onMapChange?.(sortedMap);
  }, [onMapChange, sortedMap, elementsRef, labelsRef, mapTick, lastTickRef]);
  const subscribeMapChange = (0,_base_ui_components_utils_useEventCallback__WEBPACK_IMPORTED_MODULE_2__.useEventCallback)(fn => {
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  });
  (0,_base_ui_components_utils_useIsoLayoutEffect__WEBPACK_IMPORTED_MODULE_3__.useIsoLayoutEffect)(() => {
    listeners.forEach(l => l(sortedMap));
  }, [listeners, sortedMap]);
  const contextValue = react__WEBPACK_IMPORTED_MODULE_0__.useMemo(() => ({
    register,
    unregister,
    subscribeMapChange,
    elementsRef,
    labelsRef,
    nextIndexRef
  }), [register, unregister, subscribeMapChange, elementsRef, labelsRef, nextIndexRef]);
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_CompositeListContext_js__WEBPACK_IMPORTED_MODULE_4__.CompositeListContext.Provider, {
    value: contextValue,
    children: children
  });
}
function createMap() {
  return new Map();
}
function createListeners() {
  return new Set();
}
function sortByDocumentPosition(a, b) {
  const position = a.compareDocumentPosition(b);
  if (position & Node.DOCUMENT_POSITION_FOLLOWING || position & Node.DOCUMENT_POSITION_CONTAINED_BY) {
    return -1;
  }
  if (position & Node.DOCUMENT_POSITION_PRECEDING || position & Node.DOCUMENT_POSITION_CONTAINS) {
    return 1;
  }
  return 0;
}
function disableEslintWarning(_) {}

/***/ }),

/***/ "./node_modules/@base-ui-components/react/esm/composite/list/CompositeListContext.js":
/*!*******************************************************************************************!*\
  !*** ./node_modules/@base-ui-components/react/esm/composite/list/CompositeListContext.js ***!
  \*******************************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   CompositeListContext: () => (/* binding */ CompositeListContext),
/* harmony export */   useCompositeListContext: () => (/* binding */ useCompositeListContext)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
'use client';


const CompositeListContext = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createContext({
  register: () => {},
  unregister: () => {},
  subscribeMapChange: () => {
    return () => {};
  },
  elementsRef: {
    current: []
  },
  nextIndexRef: {
    current: 0
  }
});
if (true) CompositeListContext.displayName = "CompositeListContext";
function useCompositeListContext() {
  return react__WEBPACK_IMPORTED_MODULE_0__.useContext(CompositeListContext);
}

/***/ }),

/***/ "./node_modules/@base-ui-components/react/esm/composite/list/useCompositeListItem.js":
/*!*******************************************************************************************!*\
  !*** ./node_modules/@base-ui-components/react/esm/composite/list/useCompositeListItem.js ***!
  \*******************************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   IndexGuessBehavior: () => (/* binding */ IndexGuessBehavior),
/* harmony export */   useCompositeListItem: () => (/* binding */ useCompositeListItem)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var _base_ui_components_utils_useIsoLayoutEffect__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @base-ui-components/utils/useIsoLayoutEffect */ "./node_modules/@base-ui-components/utils/esm/useIsoLayoutEffect.js");
/* harmony import */ var _CompositeListContext_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./CompositeListContext.js */ "./node_modules/@base-ui-components/react/esm/composite/list/CompositeListContext.js");
'use client';




let IndexGuessBehavior = /*#__PURE__*/function (IndexGuessBehavior) {
  IndexGuessBehavior[IndexGuessBehavior["None"] = 0] = "None";
  IndexGuessBehavior[IndexGuessBehavior["GuessFromOrder"] = 1] = "GuessFromOrder";
  return IndexGuessBehavior;
}({});

/**
 * Used to register a list item and its index (DOM position) in the `CompositeList`.
 */
function useCompositeListItem(params = {}) {
  const {
    label,
    metadata,
    textRef,
    indexGuessBehavior
  } = params;
  const {
    register,
    unregister,
    subscribeMapChange,
    elementsRef,
    labelsRef,
    nextIndexRef
  } = (0,_CompositeListContext_js__WEBPACK_IMPORTED_MODULE_2__.useCompositeListContext)();
  const indexRef = react__WEBPACK_IMPORTED_MODULE_0__.useRef(-1);
  const [index, setIndex] = react__WEBPACK_IMPORTED_MODULE_0__.useState(indexGuessBehavior === IndexGuessBehavior.GuessFromOrder ? () => {
    if (indexRef.current === -1) {
      const newIndex = nextIndexRef.current;
      nextIndexRef.current += 1;
      indexRef.current = newIndex;
    }
    return indexRef.current;
  } : -1);
  const componentRef = react__WEBPACK_IMPORTED_MODULE_0__.useRef(null);
  const ref = react__WEBPACK_IMPORTED_MODULE_0__.useCallback(node => {
    componentRef.current = node;
    if (index !== -1 && node !== null) {
      elementsRef.current[index] = node;
      if (labelsRef) {
        const isLabelDefined = label !== undefined;
        labelsRef.current[index] = isLabelDefined ? label : textRef?.current?.textContent ?? node.textContent;
      }
    }
  }, [index, elementsRef, labelsRef, label, textRef]);
  (0,_base_ui_components_utils_useIsoLayoutEffect__WEBPACK_IMPORTED_MODULE_1__.useIsoLayoutEffect)(() => {
    const node = componentRef.current;
    if (node) {
      register(node, metadata);
      return () => {
        unregister(node);
      };
    }
    return undefined;
  }, [register, unregister, metadata]);
  (0,_base_ui_components_utils_useIsoLayoutEffect__WEBPACK_IMPORTED_MODULE_1__.useIsoLayoutEffect)(() => {
    return subscribeMapChange(map => {
      const i = componentRef.current ? map.get(componentRef.current)?.index : null;
      if (i != null) {
        setIndex(i);
      }
    });
  }, [subscribeMapChange, setIndex]);
  return react__WEBPACK_IMPORTED_MODULE_0__.useMemo(() => ({
    ref,
    index
  }), [index, ref]);
}

/***/ }),

/***/ "./node_modules/@base-ui-components/react/esm/composite/root/CompositeRootContext.js":
/*!*******************************************************************************************!*\
  !*** ./node_modules/@base-ui-components/react/esm/composite/root/CompositeRootContext.js ***!
  \*******************************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   CompositeRootContext: () => (/* binding */ CompositeRootContext),
/* harmony export */   useCompositeRootContext: () => (/* binding */ useCompositeRootContext)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
'use client';


const CompositeRootContext = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createContext(undefined);
if (true) CompositeRootContext.displayName = "CompositeRootContext";
function useCompositeRootContext(optional = false) {
  const context = react__WEBPACK_IMPORTED_MODULE_0__.useContext(CompositeRootContext);
  if (context === undefined && !optional) {
    throw new Error('Base UI: CompositeRootContext is missing. Composite parts must be placed within <Composite.Root>.');
  }
  return context;
}

/***/ }),

/***/ "./node_modules/@base-ui-components/react/esm/direction-provider/DirectionContext.js":
/*!*******************************************************************************************!*\
  !*** ./node_modules/@base-ui-components/react/esm/direction-provider/DirectionContext.js ***!
  \*******************************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   DirectionContext: () => (/* binding */ DirectionContext),
/* harmony export */   useDirection: () => (/* binding */ useDirection)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
'use client';


/**
 * @internal
 */
const DirectionContext = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createContext(undefined);
if (true) DirectionContext.displayName = "DirectionContext";
function useDirection(optional = true) {
  const context = react__WEBPACK_IMPORTED_MODULE_0__.useContext(DirectionContext);
  if (context === undefined && !optional) {
    throw new Error('Base UI: DirectionContext is missing.');
  }
  return context?.direction ?? 'ltr';
}

/***/ }),

/***/ "./node_modules/@base-ui-components/react/esm/field/control/FieldControlDataAttributes.js":
/*!************************************************************************************************!*\
  !*** ./node_modules/@base-ui-components/react/esm/field/control/FieldControlDataAttributes.js ***!
  \************************************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   FieldControlDataAttributes: () => (/* binding */ FieldControlDataAttributes)
/* harmony export */ });
let FieldControlDataAttributes = /*#__PURE__*/function (FieldControlDataAttributes) {
  /**
   * Present when the field is disabled.
   */
  FieldControlDataAttributes["disabled"] = "data-disabled";
  /**
   * Present when the field is in valid state.
   */
  FieldControlDataAttributes["valid"] = "data-valid";
  /**
   * Present when the field is in invalid state.
   */
  FieldControlDataAttributes["invalid"] = "data-invalid";
  /**
   * Present when the field has been touched.
   */
  FieldControlDataAttributes["touched"] = "data-touched";
  /**
   * Present when the field's value has changed.
   */
  FieldControlDataAttributes["dirty"] = "data-dirty";
  /**
   * Present when the field is filled.
   */
  FieldControlDataAttributes["filled"] = "data-filled";
  /**
   * Present when the field control is focused.
   */
  FieldControlDataAttributes["focused"] = "data-focused";
  return FieldControlDataAttributes;
}({});

/***/ }),

/***/ "./node_modules/@base-ui-components/react/esm/field/control/useFieldControlValidation.js":
/*!***********************************************************************************************!*\
  !*** ./node_modules/@base-ui-components/react/esm/field/control/useFieldControlValidation.js ***!
  \***********************************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   useFieldControlValidation: () => (/* binding */ useFieldControlValidation)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var _base_ui_components_utils_useTimeout__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @base-ui-components/utils/useTimeout */ "./node_modules/@base-ui-components/utils/esm/useTimeout.js");
/* harmony import */ var _base_ui_components_utils_useEventCallback__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @base-ui-components/utils/useEventCallback */ "./node_modules/@base-ui-components/utils/esm/useEventCallback.js");
/* harmony import */ var _root_FieldRootContext_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../root/FieldRootContext.js */ "./node_modules/@base-ui-components/react/esm/field/root/FieldRootContext.js");
/* harmony import */ var _merge_props_index_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../merge-props/index.js */ "./node_modules/@base-ui-components/react/esm/merge-props/mergeProps.js");
/* harmony import */ var _utils_constants_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../utils/constants.js */ "./node_modules/@base-ui-components/react/esm/field/utils/constants.js");
/* harmony import */ var _form_FormContext_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../form/FormContext.js */ "./node_modules/@base-ui-components/react/esm/form/FormContext.js");
/* harmony import */ var _utils_getCombinedFieldValidityData_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../utils/getCombinedFieldValidityData.js */ "./node_modules/@base-ui-components/react/esm/field/utils/getCombinedFieldValidityData.js");
'use client';









const validityKeys = Object.keys(_utils_constants_js__WEBPACK_IMPORTED_MODULE_5__.DEFAULT_VALIDITY_STATE);
function isOnlyValueMissing(state) {
  if (!state || state.valid || !state.valueMissing) {
    return false;
  }
  let onlyValueMissing = false;
  for (const key of validityKeys) {
    if (key === 'valid') {
      continue;
    }
    if (key === 'valueMissing') {
      onlyValueMissing = state[key];
    }
    if (state[key]) {
      onlyValueMissing = false;
    }
  }
  return onlyValueMissing;
}
function useFieldControlValidation() {
  const {
    setValidityData,
    validate,
    messageIds,
    validityData,
    validationMode,
    validationDebounceTime,
    invalid,
    markedDirtyRef,
    controlId,
    state,
    name
  } = (0,_root_FieldRootContext_js__WEBPACK_IMPORTED_MODULE_3__.useFieldRootContext)();
  const {
    formRef,
    clearErrors
  } = (0,_form_FormContext_js__WEBPACK_IMPORTED_MODULE_6__.useFormContext)();
  const timeout = (0,_base_ui_components_utils_useTimeout__WEBPACK_IMPORTED_MODULE_1__.useTimeout)();
  const inputRef = react__WEBPACK_IMPORTED_MODULE_0__.useRef(null);
  const commitValidation = (0,_base_ui_components_utils_useEventCallback__WEBPACK_IMPORTED_MODULE_2__.useEventCallback)(async (value, revalidate = false) => {
    const element = inputRef.current;
    if (!element) {
      return;
    }
    if (revalidate) {
      if (state.valid !== false) {
        return;
      }
      const currentNativeValidity = element.validity;
      if (!currentNativeValidity.valueMissing) {
        // The 'valueMissing' (required) condition has been resolved by the user typing.
        // Temporarily mark the field as valid for this onChange event.
        // Other native errors (e.g., typeMismatch) will be caught by full validation on blur or submit.
        const nextValidityData = {
          value,
          state: {
            ..._utils_constants_js__WEBPACK_IMPORTED_MODULE_5__.DEFAULT_VALIDITY_STATE,
            valid: true
          },
          error: '',
          errors: [],
          initialValue: validityData.initialValue
        };
        element.setCustomValidity('');
        if (controlId) {
          const currentFieldData = formRef.current.fields.get(controlId);
          if (currentFieldData) {
            formRef.current.fields.set(controlId, {
              ...currentFieldData,
              ...(0,_utils_getCombinedFieldValidityData_js__WEBPACK_IMPORTED_MODULE_7__.getCombinedFieldValidityData)(nextValidityData, false) // invalid = false
            });
          }
        }
        setValidityData(nextValidityData);
        return;
      }

      // Value is still missing, or other conditions apply.
      // Let's use a representation of current validity for isOnlyValueMissing.
      const currentNativeValidityObject = validityKeys.reduce((acc, key) => {
        acc[key] = currentNativeValidity[key];
        return acc;
      }, {});

      // If it's (still) natively invalid due to something other than just valueMissing,
      // then bail from this revalidation on change to avoid "scolding" for other errors.
      if (!currentNativeValidityObject.valid && !isOnlyValueMissing(currentNativeValidityObject)) {
        return;
      }

      // If valueMissing is still true AND it's the only issue, or if the field is now natively valid,
      // let it fall through to the main validation logic below.
    }
    function getState(el) {
      const computedState = validityKeys.reduce((acc, key) => {
        acc[key] = el.validity[key];
        return acc;
      }, {});
      let hasOnlyValueMissingError = false;
      for (const key of validityKeys) {
        if (key === 'valid') {
          continue;
        }
        if (key === 'valueMissing' && computedState[key]) {
          hasOnlyValueMissingError = true;
        } else if (computedState[key]) {
          return computedState;
        }
      }

      // Only make `valueMissing` mark the field invalid if it's been changed
      // to reduce error noise.
      if (hasOnlyValueMissingError && !markedDirtyRef.current) {
        computedState.valid = true;
        computedState.valueMissing = false;
      }
      return computedState;
    }
    timeout.clear();
    let result = null;
    let validationErrors = [];
    const nextState = getState(element);
    let defaultValidationMessage;
    if (element.validationMessage) {
      defaultValidationMessage = element.validationMessage;
      validationErrors = [element.validationMessage];
    } else {
      const formValues = Array.from(formRef.current.fields.values()).reduce((acc, field) => {
        if (field.name && field.getValueRef) {
          acc[field.name] = field.getValueRef.current?.();
        }
        return acc;
      }, {});
      const resultOrPromise = validate(value, formValues);
      if (typeof resultOrPromise === 'object' && resultOrPromise !== null && 'then' in resultOrPromise) {
        result = await resultOrPromise;
      } else {
        result = resultOrPromise;
      }
      if (result !== null) {
        nextState.valid = false;
        nextState.customError = true;
        if (Array.isArray(result)) {
          validationErrors = result;
          element.setCustomValidity(result.join('\n'));
        } else if (result) {
          validationErrors = [result];
          element.setCustomValidity(result);
        }
      }
    }
    const nextValidityData = {
      value,
      state: nextState,
      error: defaultValidationMessage ?? (Array.isArray(result) ? result[0] : result ?? ''),
      errors: validationErrors,
      initialValue: validityData.initialValue
    };
    if (controlId) {
      const currentFieldData = formRef.current.fields.get(controlId);
      if (currentFieldData) {
        formRef.current.fields.set(controlId, {
          ...currentFieldData,
          ...(0,_utils_getCombinedFieldValidityData_js__WEBPACK_IMPORTED_MODULE_7__.getCombinedFieldValidityData)(nextValidityData, invalid)
        });
      }
    }
    setValidityData(nextValidityData);
  });
  const getValidationProps = react__WEBPACK_IMPORTED_MODULE_0__.useCallback((externalProps = {}) => (0,_merge_props_index_js__WEBPACK_IMPORTED_MODULE_4__.mergeProps)({
    ...(messageIds.length && {
      'aria-describedby': messageIds.join(' ')
    }),
    ...(state.valid === false && {
      'aria-invalid': true
    })
  }, externalProps), [messageIds, state.valid]);
  const getInputValidationProps = react__WEBPACK_IMPORTED_MODULE_0__.useCallback((externalProps = {}) => (0,_merge_props_index_js__WEBPACK_IMPORTED_MODULE_4__.mergeProps)({
    onChange(event) {
      // Workaround for https://github.com/facebook/react/issues/9023
      if (event.nativeEvent.defaultPrevented) {
        return;
      }
      clearErrors(name);
      if (validationMode !== 'onChange') {
        commitValidation(event.currentTarget.value, true);
        return;
      }
      if (invalid) {
        return;
      }
      const element = event.currentTarget;
      if (element.value === '') {
        // Ignore the debounce time for empty values.
        commitValidation(element.value);
        return;
      }
      timeout.clear();
      if (validationDebounceTime) {
        timeout.start(validationDebounceTime, () => {
          commitValidation(element.value);
        });
      } else {
        commitValidation(element.value);
      }
    }
  }, getValidationProps(externalProps)), [getValidationProps, clearErrors, name, timeout, commitValidation, invalid, validationMode, validationDebounceTime]);
  return react__WEBPACK_IMPORTED_MODULE_0__.useMemo(() => ({
    getValidationProps,
    getInputValidationProps,
    inputRef,
    commitValidation
  }), [getValidationProps, getInputValidationProps, commitValidation]);
}

/***/ }),

/***/ "./node_modules/@base-ui-components/react/esm/field/root/FieldRootContext.js":
/*!***********************************************************************************!*\
  !*** ./node_modules/@base-ui-components/react/esm/field/root/FieldRootContext.js ***!
  \***********************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   FieldRootContext: () => (/* binding */ FieldRootContext),
/* harmony export */   useFieldRootContext: () => (/* binding */ useFieldRootContext)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var _utils_noop_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../utils/noop.js */ "./node_modules/@base-ui-components/react/esm/utils/noop.js");
/* harmony import */ var _utils_constants_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils/constants.js */ "./node_modules/@base-ui-components/react/esm/field/utils/constants.js");
'use client';




const FieldRootContext = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createContext({
  invalid: undefined,
  controlId: undefined,
  setControlId: _utils_noop_js__WEBPACK_IMPORTED_MODULE_1__.NOOP,
  labelId: undefined,
  setLabelId: _utils_noop_js__WEBPACK_IMPORTED_MODULE_1__.NOOP,
  messageIds: [],
  setMessageIds: _utils_noop_js__WEBPACK_IMPORTED_MODULE_1__.NOOP,
  name: undefined,
  validityData: {
    state: _utils_constants_js__WEBPACK_IMPORTED_MODULE_2__.DEFAULT_VALIDITY_STATE,
    errors: [],
    error: '',
    value: '',
    initialValue: null
  },
  setValidityData: _utils_noop_js__WEBPACK_IMPORTED_MODULE_1__.NOOP,
  disabled: undefined,
  touched: false,
  setTouched: _utils_noop_js__WEBPACK_IMPORTED_MODULE_1__.NOOP,
  dirty: false,
  setDirty: _utils_noop_js__WEBPACK_IMPORTED_MODULE_1__.NOOP,
  filled: false,
  setFilled: _utils_noop_js__WEBPACK_IMPORTED_MODULE_1__.NOOP,
  focused: false,
  setFocused: _utils_noop_js__WEBPACK_IMPORTED_MODULE_1__.NOOP,
  validate: () => null,
  validationMode: 'onBlur',
  validationDebounceTime: 0,
  state: {
    disabled: false,
    valid: null,
    touched: false,
    dirty: false,
    filled: false,
    focused: false
  },
  markedDirtyRef: {
    current: false
  }
});
if (true) FieldRootContext.displayName = "FieldRootContext";
function useFieldRootContext(optional = true) {
  const context = react__WEBPACK_IMPORTED_MODULE_0__.useContext(FieldRootContext);
  if (context.setControlId === _utils_noop_js__WEBPACK_IMPORTED_MODULE_1__.NOOP && !optional) {
    throw new Error('Base UI: FieldRootContext is missing. Field parts must be placed within <Field.Root>.');
  }
  return context;
}

/***/ }),

/***/ "./node_modules/@base-ui-components/react/esm/field/useField.js":
/*!**********************************************************************!*\
  !*** ./node_modules/@base-ui-components/react/esm/field/useField.js ***!
  \**********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   useField: () => (/* binding */ useField)
/* harmony export */ });
/* harmony import */ var react_dom__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react-dom */ "react-dom");
/* harmony import */ var _base_ui_components_utils_useIsoLayoutEffect__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @base-ui-components/utils/useIsoLayoutEffect */ "./node_modules/@base-ui-components/utils/esm/useIsoLayoutEffect.js");
/* harmony import */ var _base_ui_components_utils_useLatestRef__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @base-ui-components/utils/useLatestRef */ "./node_modules/@base-ui-components/utils/esm/useLatestRef.js");
/* harmony import */ var _utils_getCombinedFieldValidityData_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./utils/getCombinedFieldValidityData.js */ "./node_modules/@base-ui-components/react/esm/field/utils/getCombinedFieldValidityData.js");
/* harmony import */ var _form_FormContext_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../form/FormContext.js */ "./node_modules/@base-ui-components/react/esm/form/FormContext.js");
/* harmony import */ var _root_FieldRootContext_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./root/FieldRootContext.js */ "./node_modules/@base-ui-components/react/esm/field/root/FieldRootContext.js");






function useField(params) {
  const {
    formRef
  } = (0,_form_FormContext_js__WEBPACK_IMPORTED_MODULE_4__.useFormContext)();
  const {
    invalid,
    markedDirtyRef,
    validityData,
    setValidityData
  } = (0,_root_FieldRootContext_js__WEBPACK_IMPORTED_MODULE_5__.useFieldRootContext)();
  const {
    enabled = true,
    value,
    id,
    name,
    controlRef,
    commitValidation
  } = params;
  const getValueRef = (0,_base_ui_components_utils_useLatestRef__WEBPACK_IMPORTED_MODULE_2__.useLatestRef)(params.getValue);
  (0,_base_ui_components_utils_useIsoLayoutEffect__WEBPACK_IMPORTED_MODULE_1__.useIsoLayoutEffect)(() => {
    if (!enabled) {
      return;
    }
    let initialValue = value;
    if (initialValue === undefined) {
      initialValue = getValueRef.current?.();
    }
    if (validityData.initialValue === null && initialValue !== validityData.initialValue) {
      setValidityData(prev => ({
        ...prev,
        initialValue
      }));
    }
  }, [enabled, setValidityData, value, validityData.initialValue, getValueRef]);
  (0,_base_ui_components_utils_useIsoLayoutEffect__WEBPACK_IMPORTED_MODULE_1__.useIsoLayoutEffect)(() => {
    if (!enabled) {
      return;
    }
    if (id) {
      formRef.current.fields.set(id, {
        controlRef,
        validityData: (0,_utils_getCombinedFieldValidityData_js__WEBPACK_IMPORTED_MODULE_3__.getCombinedFieldValidityData)(validityData, invalid),
        validate() {
          let nextValue = value;
          if (nextValue === undefined) {
            nextValue = getValueRef.current?.();
          }
          markedDirtyRef.current = true;
          // Synchronously update the validity state so the submit event can be prevented.
          react_dom__WEBPACK_IMPORTED_MODULE_0__.flushSync(() => commitValidation(nextValue));
        },
        getValueRef,
        name
      });
    }
  }, [commitValidation, controlRef, enabled, formRef, getValueRef, id, invalid, markedDirtyRef, name, validityData, value]);
  (0,_base_ui_components_utils_useIsoLayoutEffect__WEBPACK_IMPORTED_MODULE_1__.useIsoLayoutEffect)(() => {
    const fields = formRef.current.fields;
    return () => {
      if (id) {
        fields.delete(id);
      }
    };
  }, [formRef, id]);
}

/***/ }),

/***/ "./node_modules/@base-ui-components/react/esm/field/utils/constants.js":
/*!*****************************************************************************!*\
  !*** ./node_modules/@base-ui-components/react/esm/field/utils/constants.js ***!
  \*****************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   DEFAULT_VALIDITY_STATE: () => (/* binding */ DEFAULT_VALIDITY_STATE),
/* harmony export */   fieldValidityMapping: () => (/* binding */ fieldValidityMapping)
/* harmony export */ });
/* harmony import */ var _control_FieldControlDataAttributes_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../control/FieldControlDataAttributes.js */ "./node_modules/@base-ui-components/react/esm/field/control/FieldControlDataAttributes.js");

const DEFAULT_VALIDITY_STATE = {
  badInput: false,
  customError: false,
  patternMismatch: false,
  rangeOverflow: false,
  rangeUnderflow: false,
  stepMismatch: false,
  tooLong: false,
  tooShort: false,
  typeMismatch: false,
  valid: null,
  valueMissing: false
};
const fieldValidityMapping = {
  valid(value) {
    if (value === null) {
      return null;
    }
    if (value) {
      return {
        [_control_FieldControlDataAttributes_js__WEBPACK_IMPORTED_MODULE_0__.FieldControlDataAttributes.valid]: ''
      };
    }
    return {
      [_control_FieldControlDataAttributes_js__WEBPACK_IMPORTED_MODULE_0__.FieldControlDataAttributes.invalid]: ''
    };
  }
};

/***/ }),

/***/ "./node_modules/@base-ui-components/react/esm/field/utils/getCombinedFieldValidityData.js":
/*!************************************************************************************************!*\
  !*** ./node_modules/@base-ui-components/react/esm/field/utils/getCombinedFieldValidityData.js ***!
  \************************************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   getCombinedFieldValidityData: () => (/* binding */ getCombinedFieldValidityData)
/* harmony export */ });
/**
 * Combines the field's client-side, stateful validity data with the external invalid state to
 * determine the field's true validity.
 */
function getCombinedFieldValidityData(validityData, invalid) {
  return {
    ...validityData,
    state: {
      ...validityData.state,
      valid: !invalid && validityData.state.valid
    }
  };
}

/***/ }),

/***/ "./node_modules/@base-ui-components/react/esm/floating-ui-react/utils/composite.js":
/*!*****************************************************************************************!*\
  !*** ./node_modules/@base-ui-components/react/esm/floating-ui-react/utils/composite.js ***!
  \*****************************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   createGridCellMap: () => (/* binding */ createGridCellMap),
/* harmony export */   findNonDisabledListIndex: () => (/* binding */ findNonDisabledListIndex),
/* harmony export */   getGridCellIndexOfCorner: () => (/* binding */ getGridCellIndexOfCorner),
/* harmony export */   getGridCellIndices: () => (/* binding */ getGridCellIndices),
/* harmony export */   getGridNavigatedIndex: () => (/* binding */ getGridNavigatedIndex),
/* harmony export */   getMaxListIndex: () => (/* binding */ getMaxListIndex),
/* harmony export */   getMinListIndex: () => (/* binding */ getMinListIndex),
/* harmony export */   isDifferentGridRow: () => (/* binding */ isDifferentGridRow),
/* harmony export */   isIndexOutOfListBounds: () => (/* binding */ isIndexOutOfListBounds),
/* harmony export */   isListIndexDisabled: () => (/* binding */ isListIndexDisabled)
/* harmony export */ });
/* harmony import */ var _floating_ui_utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @floating-ui/utils */ "./node_modules/@floating-ui/utils/dist/floating-ui.utils.mjs");
/* harmony import */ var _event_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./event.js */ "./node_modules/@base-ui-components/react/esm/floating-ui-react/utils/event.js");
/* harmony import */ var _constants_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./constants.js */ "./node_modules/@base-ui-components/react/esm/floating-ui-react/utils/constants.js");



function isDifferentGridRow(index, cols, prevRow) {
  return Math.floor(index / cols) !== prevRow;
}
function isIndexOutOfListBounds(listRef, index) {
  return index < 0 || index >= listRef.current.length;
}
function getMinListIndex(listRef, disabledIndices) {
  return findNonDisabledListIndex(listRef, {
    disabledIndices
  });
}
function getMaxListIndex(listRef, disabledIndices) {
  return findNonDisabledListIndex(listRef, {
    decrement: true,
    startingIndex: listRef.current.length,
    disabledIndices
  });
}
function findNonDisabledListIndex(listRef, {
  startingIndex = -1,
  decrement = false,
  disabledIndices,
  amount = 1
} = {}) {
  let index = startingIndex;
  do {
    index += decrement ? -amount : amount;
  } while (index >= 0 && index <= listRef.current.length - 1 && isListIndexDisabled(listRef, index, disabledIndices));
  return index;
}
function getGridNavigatedIndex(listRef, {
  event,
  orientation,
  loop,
  rtl,
  cols,
  disabledIndices,
  minIndex,
  maxIndex,
  prevIndex,
  stopEvent: stop = false
}) {
  let nextIndex = prevIndex;
  if (event.key === _constants_js__WEBPACK_IMPORTED_MODULE_2__.ARROW_UP) {
    if (stop) {
      (0,_event_js__WEBPACK_IMPORTED_MODULE_1__.stopEvent)(event);
    }
    if (prevIndex === -1) {
      nextIndex = maxIndex;
    } else {
      nextIndex = findNonDisabledListIndex(listRef, {
        startingIndex: nextIndex,
        amount: cols,
        decrement: true,
        disabledIndices
      });
      if (loop && (prevIndex - cols < minIndex || nextIndex < 0)) {
        const col = prevIndex % cols;
        const maxCol = maxIndex % cols;
        const offset = maxIndex - (maxCol - col);
        if (maxCol === col) {
          nextIndex = maxIndex;
        } else {
          nextIndex = maxCol > col ? offset : offset - cols;
        }
      }
    }
    if (isIndexOutOfListBounds(listRef, nextIndex)) {
      nextIndex = prevIndex;
    }
  }
  if (event.key === _constants_js__WEBPACK_IMPORTED_MODULE_2__.ARROW_DOWN) {
    if (stop) {
      (0,_event_js__WEBPACK_IMPORTED_MODULE_1__.stopEvent)(event);
    }
    if (prevIndex === -1) {
      nextIndex = minIndex;
    } else {
      nextIndex = findNonDisabledListIndex(listRef, {
        startingIndex: prevIndex,
        amount: cols,
        disabledIndices
      });
      if (loop && prevIndex + cols > maxIndex) {
        nextIndex = findNonDisabledListIndex(listRef, {
          startingIndex: prevIndex % cols - cols,
          amount: cols,
          disabledIndices
        });
      }
    }
    if (isIndexOutOfListBounds(listRef, nextIndex)) {
      nextIndex = prevIndex;
    }
  }

  // Remains on the same row/column.
  if (orientation === 'both') {
    const prevRow = (0,_floating_ui_utils__WEBPACK_IMPORTED_MODULE_0__.floor)(prevIndex / cols);
    if (event.key === (rtl ? _constants_js__WEBPACK_IMPORTED_MODULE_2__.ARROW_LEFT : _constants_js__WEBPACK_IMPORTED_MODULE_2__.ARROW_RIGHT)) {
      if (stop) {
        (0,_event_js__WEBPACK_IMPORTED_MODULE_1__.stopEvent)(event);
      }
      if (prevIndex % cols !== cols - 1) {
        nextIndex = findNonDisabledListIndex(listRef, {
          startingIndex: prevIndex,
          disabledIndices
        });
        if (loop && isDifferentGridRow(nextIndex, cols, prevRow)) {
          nextIndex = findNonDisabledListIndex(listRef, {
            startingIndex: prevIndex - prevIndex % cols - 1,
            disabledIndices
          });
        }
      } else if (loop) {
        nextIndex = findNonDisabledListIndex(listRef, {
          startingIndex: prevIndex - prevIndex % cols - 1,
          disabledIndices
        });
      }
      if (isDifferentGridRow(nextIndex, cols, prevRow)) {
        nextIndex = prevIndex;
      }
    }
    if (event.key === (rtl ? _constants_js__WEBPACK_IMPORTED_MODULE_2__.ARROW_RIGHT : _constants_js__WEBPACK_IMPORTED_MODULE_2__.ARROW_LEFT)) {
      if (stop) {
        (0,_event_js__WEBPACK_IMPORTED_MODULE_1__.stopEvent)(event);
      }
      if (prevIndex % cols !== 0) {
        nextIndex = findNonDisabledListIndex(listRef, {
          startingIndex: prevIndex,
          decrement: true,
          disabledIndices
        });
        if (loop && isDifferentGridRow(nextIndex, cols, prevRow)) {
          nextIndex = findNonDisabledListIndex(listRef, {
            startingIndex: prevIndex + (cols - prevIndex % cols),
            decrement: true,
            disabledIndices
          });
        }
      } else if (loop) {
        nextIndex = findNonDisabledListIndex(listRef, {
          startingIndex: prevIndex + (cols - prevIndex % cols),
          decrement: true,
          disabledIndices
        });
      }
      if (isDifferentGridRow(nextIndex, cols, prevRow)) {
        nextIndex = prevIndex;
      }
    }
    const lastRow = (0,_floating_ui_utils__WEBPACK_IMPORTED_MODULE_0__.floor)(maxIndex / cols) === prevRow;
    if (isIndexOutOfListBounds(listRef, nextIndex)) {
      if (loop && lastRow) {
        nextIndex = event.key === (rtl ? _constants_js__WEBPACK_IMPORTED_MODULE_2__.ARROW_RIGHT : _constants_js__WEBPACK_IMPORTED_MODULE_2__.ARROW_LEFT) ? maxIndex : findNonDisabledListIndex(listRef, {
          startingIndex: prevIndex - prevIndex % cols - 1,
          disabledIndices
        });
      } else {
        nextIndex = prevIndex;
      }
    }
  }
  return nextIndex;
}

/** For each cell index, gets the item index that occupies that cell */
function createGridCellMap(sizes, cols, dense) {
  const cellMap = [];
  let startIndex = 0;
  sizes.forEach(({
    width,
    height
  }, index) => {
    if (width > cols) {
      if (true) {
        throw new Error(`[Floating UI]: Invalid grid - item width at index ${index} is greater than grid columns`);
      }
    }
    let itemPlaced = false;
    if (dense) {
      startIndex = 0;
    }
    while (!itemPlaced) {
      const targetCells = [];
      for (let i = 0; i < width; i += 1) {
        for (let j = 0; j < height; j += 1) {
          targetCells.push(startIndex + i + j * cols);
        }
      }
      if (startIndex % cols + width <= cols && targetCells.every(cell => cellMap[cell] == null)) {
        targetCells.forEach(cell => {
          cellMap[cell] = index;
        });
        itemPlaced = true;
      } else {
        startIndex += 1;
      }
    }
  });

  // convert into a non-sparse array
  return [...cellMap];
}

/** Gets cell index of an item's corner or -1 when index is -1. */
function getGridCellIndexOfCorner(index, sizes, cellMap, cols, corner) {
  if (index === -1) {
    return -1;
  }
  const firstCellIndex = cellMap.indexOf(index);
  const sizeItem = sizes[index];
  switch (corner) {
    case 'tl':
      return firstCellIndex;
    case 'tr':
      if (!sizeItem) {
        return firstCellIndex;
      }
      return firstCellIndex + sizeItem.width - 1;
    case 'bl':
      if (!sizeItem) {
        return firstCellIndex;
      }
      return firstCellIndex + (sizeItem.height - 1) * cols;
    case 'br':
      return cellMap.lastIndexOf(index);
    default:
      return -1;
  }
}

/** Gets all cell indices that correspond to the specified indices */
function getGridCellIndices(indices, cellMap) {
  return cellMap.flatMap((index, cellIndex) => indices.includes(index) ? [cellIndex] : []);
}
function isListIndexDisabled(listRef, index, disabledIndices) {
  if (typeof disabledIndices === 'function') {
    return disabledIndices(index);
  }
  if (disabledIndices) {
    return disabledIndices.includes(index);
  }
  const element = listRef.current[index];
  return element == null || element.hasAttribute('disabled') || element.getAttribute('aria-disabled') === 'true';
}

/***/ }),

/***/ "./node_modules/@base-ui-components/react/esm/floating-ui-react/utils/constants.js":
/*!*****************************************************************************************!*\
  !*** ./node_modules/@base-ui-components/react/esm/floating-ui-react/utils/constants.js ***!
  \*****************************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ACTIVE_KEY: () => (/* binding */ ACTIVE_KEY),
/* harmony export */   ARROW_DOWN: () => (/* binding */ ARROW_DOWN),
/* harmony export */   ARROW_LEFT: () => (/* binding */ ARROW_LEFT),
/* harmony export */   ARROW_RIGHT: () => (/* binding */ ARROW_RIGHT),
/* harmony export */   ARROW_UP: () => (/* binding */ ARROW_UP),
/* harmony export */   FOCUSABLE_ATTRIBUTE: () => (/* binding */ FOCUSABLE_ATTRIBUTE),
/* harmony export */   SELECTED_KEY: () => (/* binding */ SELECTED_KEY),
/* harmony export */   TYPEABLE_SELECTOR: () => (/* binding */ TYPEABLE_SELECTOR)
/* harmony export */ });
const FOCUSABLE_ATTRIBUTE = 'data-base-ui-focusable';
const ACTIVE_KEY = 'active';
const SELECTED_KEY = 'selected';
const TYPEABLE_SELECTOR = "input:not([type='hidden']):not([disabled])," + "[contenteditable]:not([contenteditable='false']),textarea:not([disabled])";
const ARROW_LEFT = 'ArrowLeft';
const ARROW_RIGHT = 'ArrowRight';
const ARROW_UP = 'ArrowUp';
const ARROW_DOWN = 'ArrowDown';

/***/ }),

/***/ "./node_modules/@base-ui-components/react/esm/floating-ui-react/utils/event.js":
/*!*************************************************************************************!*\
  !*** ./node_modules/@base-ui-components/react/esm/floating-ui-react/utils/event.js ***!
  \*************************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   isMouseLikePointerType: () => (/* binding */ isMouseLikePointerType),
/* harmony export */   isReactEvent: () => (/* binding */ isReactEvent),
/* harmony export */   isVirtualClick: () => (/* binding */ isVirtualClick),
/* harmony export */   isVirtualPointerEvent: () => (/* binding */ isVirtualPointerEvent),
/* harmony export */   stopEvent: () => (/* binding */ stopEvent)
/* harmony export */ });
/* harmony import */ var _base_ui_components_utils_detectBrowser__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @base-ui-components/utils/detectBrowser */ "./node_modules/@base-ui-components/utils/esm/detectBrowser.js");

function stopEvent(event) {
  event.preventDefault();
  event.stopPropagation();
}
function isReactEvent(event) {
  return 'nativeEvent' in event;
}

// License: https://github.com/adobe/react-spectrum/blob/b35d5c02fe900badccd0cf1a8f23bb593419f238/packages/@react-aria/utils/src/isVirtualEvent.ts
function isVirtualClick(event) {
  // FIXME: Firefox is now emitting a deprecation warning for `mozInputSource`.
  // Try to find a workaround for this. `react-aria` source still has the check.
  if (event.mozInputSource === 0 && event.isTrusted) {
    return true;
  }
  if (_base_ui_components_utils_detectBrowser__WEBPACK_IMPORTED_MODULE_0__.isAndroid && event.pointerType) {
    return event.type === 'click' && event.buttons === 1;
  }
  return event.detail === 0 && !event.pointerType;
}
function isVirtualPointerEvent(event) {
  if (_base_ui_components_utils_detectBrowser__WEBPACK_IMPORTED_MODULE_0__.isJSDOM) {
    return false;
  }
  return !_base_ui_components_utils_detectBrowser__WEBPACK_IMPORTED_MODULE_0__.isAndroid && event.width === 0 && event.height === 0 || _base_ui_components_utils_detectBrowser__WEBPACK_IMPORTED_MODULE_0__.isAndroid && event.width === 1 && event.height === 1 && event.pressure === 0 && event.detail === 0 && event.pointerType === 'mouse' ||
  // iOS VoiceOver returns 0.333• for width/height.
  event.width < 1 && event.height < 1 && event.pressure === 0 && event.detail === 0 && event.pointerType === 'touch';
}
function isMouseLikePointerType(pointerType, strict) {
  // On some Linux machines with Chromium, mouse inputs return a `pointerType`
  // of "pen": https://github.com/floating-ui/floating-ui/issues/2015
  const values = ['mouse', 'pen'];
  if (!strict) {
    values.push('', undefined);
  }
  return values.includes(pointerType);
}

/***/ }),

/***/ "./node_modules/@base-ui-components/react/esm/form/FormContext.js":
/*!************************************************************************!*\
  !*** ./node_modules/@base-ui-components/react/esm/form/FormContext.js ***!
  \************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   FormContext: () => (/* binding */ FormContext),
/* harmony export */   useFormContext: () => (/* binding */ useFormContext)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var _utils_noop_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/noop.js */ "./node_modules/@base-ui-components/react/esm/utils/noop.js");
'use client';



const FormContext = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createContext({
  formRef: {
    current: {
      fields: new Map()
    }
  },
  errors: {},
  clearErrors: _utils_noop_js__WEBPACK_IMPORTED_MODULE_1__.NOOP
});
if (true) FormContext.displayName = "FormContext";
function useFormContext() {
  return react__WEBPACK_IMPORTED_MODULE_0__.useContext(FormContext);
}

/***/ }),

/***/ "./node_modules/@base-ui-components/react/esm/merge-props/mergeProps.js":
/*!******************************************************************************!*\
  !*** ./node_modules/@base-ui-components/react/esm/merge-props/mergeProps.js ***!
  \******************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   makeEventPreventable: () => (/* binding */ makeEventPreventable),
/* harmony export */   mergeClassNames: () => (/* binding */ mergeClassNames),
/* harmony export */   mergeProps: () => (/* binding */ mergeProps),
/* harmony export */   mergePropsN: () => (/* binding */ mergePropsN)
/* harmony export */ });
/* harmony import */ var _base_ui_components_utils_mergeObjects__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @base-ui-components/utils/mergeObjects */ "./node_modules/@base-ui-components/utils/esm/mergeObjects.js");

const EMPTY_PROPS = {};

/**
 * Merges multiple sets of React props. It follows the Object.assign pattern where the rightmost object's fields overwrite
 * the conflicting ones from others. This doesn't apply to event handlers, `className` and `style` props.
 * Event handlers are merged such that they are called in sequence (the rightmost one being called first),
 * and allows the user to prevent the subsequent event handlers from being
 * executed by attaching a `preventBaseUIHandler` method.
 * It also merges the `className` and `style` props, whereby the classes are concatenated
 * and the rightmost styles overwrite the subsequent ones.
 *
 * Props can either be provided as objects or as functions that take the previous props as an argument.
 * The function will receive the merged props up to that point (going from left to right):
 * so in the case of `(obj1, obj2, fn, obj3)`, `fn` will receive the merged props of `obj1` and `obj2`.
 * The function is responsible for chaining event handlers if needed (i.e. we don't run the merge logic).
 *
 * Event handlers returned by the functions are not automatically prevented when `preventBaseUIHandler` is called.
 * They must check `event.baseUIHandlerPrevented` themselves and bail out if it's true.
 *
 * @important **`ref` is not merged.**
 * @param props props to merge.
 * @returns the merged props.
 */
/* eslint-disable id-denylist */

function mergeProps(a, b, c, d, e) {
  // We need to mutably own `merged`
  let merged = {
    ...resolvePropsGetter(a, EMPTY_PROPS)
  };
  if (b) {
    merged = mergeOne(merged, b);
  }
  if (c) {
    merged = mergeOne(merged, c);
  }
  if (d) {
    merged = mergeOne(merged, d);
  }
  if (e) {
    merged = mergeOne(merged, e);
  }
  return merged;
}
/* eslint-enable id-denylist */

function mergePropsN(props) {
  if (props.length === 0) {
    return EMPTY_PROPS;
  }
  if (props.length === 1) {
    return resolvePropsGetter(props[0], EMPTY_PROPS);
  }

  // We need to mutably own `merged`
  let merged = {
    ...resolvePropsGetter(props[0], EMPTY_PROPS)
  };
  for (let i = 1; i < props.length; i += 1) {
    merged = mergeOne(merged, props[i]);
  }
  return merged;
}
function mergeOne(merged, inputProps) {
  if (isPropsGetter(inputProps)) {
    return inputProps(merged);
  }
  return mutablyMergeInto(merged, inputProps);
}

/**
 * Merges two sets of props. In case of conflicts, the external props take precedence.
 */
function mutablyMergeInto(mergedProps, externalProps) {
  if (!externalProps) {
    return mergedProps;
  }

  // eslint-disable-next-line guard-for-in
  for (const propName in externalProps) {
    const externalPropValue = externalProps[propName];
    switch (propName) {
      case 'style':
        {
          mergedProps[propName] = (0,_base_ui_components_utils_mergeObjects__WEBPACK_IMPORTED_MODULE_0__.mergeObjects)(mergedProps.style, externalPropValue);
          break;
        }
      case 'className':
        {
          mergedProps[propName] = mergeClassNames(mergedProps.className, externalPropValue);
          break;
        }
      default:
        {
          if (isEventHandler(propName, externalPropValue)) {
            mergedProps[propName] = mergeEventHandlers(mergedProps[propName], externalPropValue);
          } else {
            mergedProps[propName] = externalPropValue;
          }
        }
    }
  }
  return mergedProps;
}
function isEventHandler(key, value) {
  // This approach is more efficient than using a regex.
  const code0 = key.charCodeAt(0);
  const code1 = key.charCodeAt(1);
  const code2 = key.charCodeAt(2);
  return code0 === 111 /* o */ && code1 === 110 /* n */ && code2 >= 65 /* A */ && code2 <= 90 /* Z */ && (typeof value === 'function' || typeof value === 'undefined');
}
function isPropsGetter(inputProps) {
  return typeof inputProps === 'function';
}
function resolvePropsGetter(inputProps, previousProps) {
  if (isPropsGetter(inputProps)) {
    return inputProps(previousProps);
  }
  return inputProps ?? EMPTY_PROPS;
}
function mergeEventHandlers(ourHandler, theirHandler) {
  if (!theirHandler) {
    return ourHandler;
  }
  if (!ourHandler) {
    return theirHandler;
  }
  return event => {
    if (isSyntheticEvent(event)) {
      const baseUIEvent = event;
      makeEventPreventable(baseUIEvent);
      const result = theirHandler(baseUIEvent);
      if (!baseUIEvent.baseUIHandlerPrevented) {
        ourHandler?.(baseUIEvent);
      }
      return result;
    }
    const result = theirHandler(event);
    ourHandler?.(event);
    return result;
  };
}
function makeEventPreventable(event) {
  event.preventBaseUIHandler = () => {
    event.baseUIHandlerPrevented = true;
  };
  return event;
}
function mergeClassNames(ourClassName, theirClassName) {
  if (theirClassName) {
    if (ourClassName) {
      // eslint-disable-next-line prefer-template
      return theirClassName + ' ' + ourClassName;
    }
    return theirClassName;
  }
  return ourClassName;
}
function isSyntheticEvent(event) {
  return event != null && typeof event === 'object' && 'nativeEvent' in event;
}

/***/ }),

/***/ "./node_modules/@base-ui-components/react/esm/number-field/decrement/NumberFieldDecrement.js":
/*!***************************************************************************************************!*\
  !*** ./node_modules/@base-ui-components/react/esm/number-field/decrement/NumberFieldDecrement.js ***!
  \***************************************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   NumberFieldDecrement: () => (/* binding */ NumberFieldDecrement)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var _utils_useRenderElement_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../utils/useRenderElement.js */ "./node_modules/@base-ui-components/react/esm/utils/useRenderElement.js");
/* harmony import */ var _use_button_index_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../use-button/index.js */ "./node_modules/@base-ui-components/react/esm/use-button/useButton.js");
/* harmony import */ var _root_NumberFieldRootContext_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../root/NumberFieldRootContext.js */ "./node_modules/@base-ui-components/react/esm/number-field/root/NumberFieldRootContext.js");
/* harmony import */ var _root_useNumberFieldButton_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../root/useNumberFieldButton.js */ "./node_modules/@base-ui-components/react/esm/number-field/root/useNumberFieldButton.js");
/* harmony import */ var _utils_styleHooks_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../utils/styleHooks.js */ "./node_modules/@base-ui-components/react/esm/number-field/utils/styleHooks.js");
'use client';








/**
 * A stepper button that decreases the field value when clicked.
 * Renders an `<button>` element.
 *
 * Documentation: [Base UI Number Field](https://base-ui.com/react/components/number-field)
 */
const NumberFieldDecrement = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.forwardRef(function NumberFieldDecrement(componentProps, forwardedRef) {
  const {
    render,
    className,
    disabled: disabledProp = false,
    nativeButton = true,
    ...elementProps
  } = componentProps;
  const {
    allowInputSyncRef,
    disabled: contextDisabled,
    formatOptionsRef,
    getStepAmount,
    id,
    incrementValue,
    inputRef,
    inputValue,
    intentionalTouchCheckTimeout,
    isPressedRef,
    maxWithDefault,
    minWithDefault,
    movesAfterTouchRef,
    readOnly,
    setValue,
    startAutoChange,
    state,
    stopAutoChange,
    value,
    valueRef,
    locale
  } = (0,_root_NumberFieldRootContext_js__WEBPACK_IMPORTED_MODULE_3__.useNumberFieldRootContext)();
  const disabled = disabledProp || contextDisabled;
  const {
    props
  } = (0,_root_useNumberFieldButton_js__WEBPACK_IMPORTED_MODULE_4__.useNumberFieldButton)({
    isIncrement: false,
    inputRef,
    startAutoChange,
    stopAutoChange,
    minWithDefault,
    maxWithDefault,
    value,
    inputValue,
    disabled,
    readOnly,
    id,
    setValue,
    getStepAmount,
    incrementValue,
    allowInputSyncRef,
    formatOptionsRef,
    valueRef,
    isPressedRef,
    intentionalTouchCheckTimeout,
    movesAfterTouchRef,
    locale
  });
  const {
    getButtonProps,
    buttonRef
  } = (0,_use_button_index_js__WEBPACK_IMPORTED_MODULE_2__.useButton)({
    disabled,
    native: nativeButton
  });
  const buttonState = react__WEBPACK_IMPORTED_MODULE_0__.useMemo(() => ({
    ...state,
    disabled
  }), [state, disabled]);
  const element = (0,_utils_useRenderElement_js__WEBPACK_IMPORTED_MODULE_1__.useRenderElement)('button', componentProps, {
    ref: [forwardedRef, buttonRef],
    state: buttonState,
    props: [props, elementProps, getButtonProps],
    customStyleHookMapping: _utils_styleHooks_js__WEBPACK_IMPORTED_MODULE_5__.styleHookMapping
  });
  return element;
});
if (true) NumberFieldDecrement.displayName = "NumberFieldDecrement";

/***/ }),

/***/ "./node_modules/@base-ui-components/react/esm/number-field/group/NumberFieldGroup.js":
/*!*******************************************************************************************!*\
  !*** ./node_modules/@base-ui-components/react/esm/number-field/group/NumberFieldGroup.js ***!
  \*******************************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   NumberFieldGroup: () => (/* binding */ NumberFieldGroup)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var _root_NumberFieldRootContext_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../root/NumberFieldRootContext.js */ "./node_modules/@base-ui-components/react/esm/number-field/root/NumberFieldRootContext.js");
/* harmony import */ var _utils_styleHooks_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils/styleHooks.js */ "./node_modules/@base-ui-components/react/esm/number-field/utils/styleHooks.js");
/* harmony import */ var _utils_useRenderElement_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../utils/useRenderElement.js */ "./node_modules/@base-ui-components/react/esm/utils/useRenderElement.js");
'use client';






/**
 * Groups the input with the increment and decrement buttons.
 * Renders a `<div>` element.
 *
 * Documentation: [Base UI Number Field](https://base-ui.com/react/components/number-field)
 */
const NumberFieldGroup = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.forwardRef(function NumberFieldGroup(componentProps, forwardedRef) {
  const {
    render,
    className,
    ...elementProps
  } = componentProps;
  const {
    state
  } = (0,_root_NumberFieldRootContext_js__WEBPACK_IMPORTED_MODULE_1__.useNumberFieldRootContext)();
  const element = (0,_utils_useRenderElement_js__WEBPACK_IMPORTED_MODULE_3__.useRenderElement)('div', componentProps, {
    ref: forwardedRef,
    state,
    props: [{
      role: 'group'
    }, elementProps],
    customStyleHookMapping: _utils_styleHooks_js__WEBPACK_IMPORTED_MODULE_2__.styleHookMapping
  });
  return element;
});
if (true) NumberFieldGroup.displayName = "NumberFieldGroup";

/***/ }),

/***/ "./node_modules/@base-ui-components/react/esm/number-field/increment/NumberFieldIncrement.js":
/*!***************************************************************************************************!*\
  !*** ./node_modules/@base-ui-components/react/esm/number-field/increment/NumberFieldIncrement.js ***!
  \***************************************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   NumberFieldIncrement: () => (/* binding */ NumberFieldIncrement)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var _utils_useRenderElement_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../utils/useRenderElement.js */ "./node_modules/@base-ui-components/react/esm/utils/useRenderElement.js");
/* harmony import */ var _use_button_index_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../use-button/index.js */ "./node_modules/@base-ui-components/react/esm/use-button/useButton.js");
/* harmony import */ var _root_NumberFieldRootContext_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../root/NumberFieldRootContext.js */ "./node_modules/@base-ui-components/react/esm/number-field/root/NumberFieldRootContext.js");
/* harmony import */ var _root_useNumberFieldButton_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../root/useNumberFieldButton.js */ "./node_modules/@base-ui-components/react/esm/number-field/root/useNumberFieldButton.js");
/* harmony import */ var _utils_styleHooks_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../utils/styleHooks.js */ "./node_modules/@base-ui-components/react/esm/number-field/utils/styleHooks.js");
'use client';








/**
 * A stepper button that increases the field value when clicked.
 * Renders an `<button>` element.
 *
 * Documentation: [Base UI Number Field](https://base-ui.com/react/components/number-field)
 */
const NumberFieldIncrement = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.forwardRef(function NumberFieldIncrement(componentProps, forwardedRef) {
  const {
    render,
    className,
    disabled: disabledProp = false,
    nativeButton = true,
    ...elementProps
  } = componentProps;
  const {
    allowInputSyncRef,
    disabled: contextDisabled,
    formatOptionsRef,
    getStepAmount,
    id,
    incrementValue,
    inputRef,
    inputValue,
    intentionalTouchCheckTimeout,
    isPressedRef,
    locale,
    maxWithDefault,
    minWithDefault,
    movesAfterTouchRef,
    readOnly,
    setValue,
    startAutoChange,
    state,
    stopAutoChange,
    value,
    valueRef
  } = (0,_root_NumberFieldRootContext_js__WEBPACK_IMPORTED_MODULE_3__.useNumberFieldRootContext)();
  const disabled = disabledProp || contextDisabled;
  const {
    props
  } = (0,_root_useNumberFieldButton_js__WEBPACK_IMPORTED_MODULE_4__.useNumberFieldButton)({
    isIncrement: true,
    inputRef,
    startAutoChange,
    stopAutoChange,
    minWithDefault,
    maxWithDefault,
    value,
    inputValue,
    disabled,
    readOnly,
    id,
    setValue,
    getStepAmount,
    incrementValue,
    allowInputSyncRef,
    formatOptionsRef,
    valueRef,
    isPressedRef,
    intentionalTouchCheckTimeout,
    movesAfterTouchRef,
    locale
  });
  const {
    getButtonProps,
    buttonRef
  } = (0,_use_button_index_js__WEBPACK_IMPORTED_MODULE_2__.useButton)({
    disabled,
    native: nativeButton
  });
  const buttonState = react__WEBPACK_IMPORTED_MODULE_0__.useMemo(() => ({
    ...state,
    disabled
  }), [state, disabled]);
  const element = (0,_utils_useRenderElement_js__WEBPACK_IMPORTED_MODULE_1__.useRenderElement)('button', componentProps, {
    ref: [forwardedRef, buttonRef],
    state: buttonState,
    props: [props, elementProps, getButtonProps],
    customStyleHookMapping: _utils_styleHooks_js__WEBPACK_IMPORTED_MODULE_5__.styleHookMapping
  });
  return element;
});
if (true) NumberFieldIncrement.displayName = "NumberFieldIncrement";

/***/ }),

/***/ "./node_modules/@base-ui-components/react/esm/number-field/input/NumberFieldInput.js":
/*!*******************************************************************************************!*\
  !*** ./node_modules/@base-ui-components/react/esm/number-field/input/NumberFieldInput.js ***!
  \*******************************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   NumberFieldInput: () => (/* binding */ NumberFieldInput)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var _base_ui_components_utils_useIsoLayoutEffect__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @base-ui-components/utils/useIsoLayoutEffect */ "./node_modules/@base-ui-components/utils/esm/useIsoLayoutEffect.js");
/* harmony import */ var _floating_ui_react_utils_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../floating-ui-react/utils.js */ "./node_modules/@base-ui-components/react/esm/floating-ui-react/utils/event.js");
/* harmony import */ var _root_NumberFieldRootContext_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../root/NumberFieldRootContext.js */ "./node_modules/@base-ui-components/react/esm/number-field/root/NumberFieldRootContext.js");
/* harmony import */ var _field_root_FieldRootContext_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../field/root/FieldRootContext.js */ "./node_modules/@base-ui-components/react/esm/field/root/FieldRootContext.js");
/* harmony import */ var _field_control_useFieldControlValidation_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../field/control/useFieldControlValidation.js */ "./node_modules/@base-ui-components/react/esm/field/control/useFieldControlValidation.js");
/* harmony import */ var _field_utils_constants_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../field/utils/constants.js */ "./node_modules/@base-ui-components/react/esm/field/utils/constants.js");
/* harmony import */ var _utils_constants_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../utils/constants.js */ "./node_modules/@base-ui-components/react/esm/number-field/utils/constants.js");
/* harmony import */ var _utils_parse_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../utils/parse.js */ "./node_modules/@base-ui-components/react/esm/number-field/utils/parse.js");
/* harmony import */ var _utils_styleHooks_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../utils/styleHooks.js */ "./node_modules/@base-ui-components/react/esm/number-field/utils/styleHooks.js");
/* harmony import */ var _field_useField_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../../field/useField.js */ "./node_modules/@base-ui-components/react/esm/field/useField.js");
/* harmony import */ var _form_FormContext_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../../form/FormContext.js */ "./node_modules/@base-ui-components/react/esm/form/FormContext.js");
/* harmony import */ var _utils_useRenderElement_js__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ../../utils/useRenderElement.js */ "./node_modules/@base-ui-components/react/esm/utils/useRenderElement.js");
/* harmony import */ var _utils_formatNumber_js__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ../../utils/formatNumber.js */ "./node_modules/@base-ui-components/react/esm/utils/formatNumber.js");
'use client';















const customStyleHookMapping = {
  ..._field_utils_constants_js__WEBPACK_IMPORTED_MODULE_6__.fieldValidityMapping,
  ..._utils_styleHooks_js__WEBPACK_IMPORTED_MODULE_9__.styleHookMapping
};
const NAVIGATE_KEYS = new Set(['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter', 'Escape']);

/**
 * The native input control in the number field.
 * Renders an `<input>` element.
 *
 * Documentation: [Base UI Number Field](https://base-ui.com/react/components/number-field)
 */
const NumberFieldInput = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.forwardRef(function NumberFieldInput(componentProps, forwardedRef) {
  const {
    render,
    className,
    ...elementProps
  } = componentProps;
  const {
    allowInputSyncRef,
    disabled,
    formatOptionsRef,
    getAllowedNonNumericKeys,
    getStepAmount,
    id,
    incrementValue,
    inputMode,
    inputValue,
    max,
    min,
    name,
    readOnly,
    required,
    setValue,
    state,
    setInputValue,
    locale,
    inputRef,
    value
  } = (0,_root_NumberFieldRootContext_js__WEBPACK_IMPORTED_MODULE_3__.useNumberFieldRootContext)();
  const {
    clearErrors
  } = (0,_form_FormContext_js__WEBPACK_IMPORTED_MODULE_11__.useFormContext)();
  const {
    labelId,
    validationMode,
    setTouched,
    setFocused,
    invalid
  } = (0,_field_root_FieldRootContext_js__WEBPACK_IMPORTED_MODULE_4__.useFieldRootContext)();
  const {
    getInputValidationProps,
    getValidationProps,
    commitValidation,
    inputRef: inputValidationRef
  } = (0,_field_control_useFieldControlValidation_js__WEBPACK_IMPORTED_MODULE_5__.useFieldControlValidation)();
  const hasTouchedInputRef = react__WEBPACK_IMPORTED_MODULE_0__.useRef(false);
  const blockRevalidationRef = react__WEBPACK_IMPORTED_MODULE_0__.useRef(false);
  (0,_field_useField_js__WEBPACK_IMPORTED_MODULE_10__.useField)({
    id,
    commitValidation,
    value,
    controlRef: inputRef,
    name,
    getValue: () => value ?? null
  });
  const prevValueRef = react__WEBPACK_IMPORTED_MODULE_0__.useRef(value);
  const prevInputValueRef = react__WEBPACK_IMPORTED_MODULE_0__.useRef(inputValue);
  (0,_base_ui_components_utils_useIsoLayoutEffect__WEBPACK_IMPORTED_MODULE_1__.useIsoLayoutEffect)(() => {
    if (prevValueRef.current === value && prevInputValueRef.current === inputValue) {
      return;
    }
    clearErrors(name);
    if (validationMode === 'onChange') {
      commitValidation(value);
    }
  }, [value, inputValue, name, clearErrors, validationMode, commitValidation]);
  (0,_base_ui_components_utils_useIsoLayoutEffect__WEBPACK_IMPORTED_MODULE_1__.useIsoLayoutEffect)(() => {
    if (prevValueRef.current === value || validationMode === 'onChange') {
      return;
    }
    if (blockRevalidationRef.current) {
      blockRevalidationRef.current = false;
      return;
    }
    commitValidation(value, true);
  }, [commitValidation, validationMode, value]);
  (0,_base_ui_components_utils_useIsoLayoutEffect__WEBPACK_IMPORTED_MODULE_1__.useIsoLayoutEffect)(() => {
    prevValueRef.current = value;
    prevInputValueRef.current = inputValue;
  }, [value, inputValue]);
  const inputProps = {
    id,
    required,
    disabled,
    readOnly,
    inputMode,
    value: inputValue,
    type: 'text',
    autoComplete: 'off',
    autoCorrect: 'off',
    spellCheck: 'false',
    'aria-roledescription': 'Number field',
    'aria-invalid': invalid || undefined,
    'aria-labelledby': labelId,
    // If the server's locale does not match the client's locale, the formatting may not match,
    // causing a hydration mismatch.
    suppressHydrationWarning: true,
    onFocus(event) {
      if (event.defaultPrevented || readOnly || disabled || hasTouchedInputRef.current) {
        return;
      }
      hasTouchedInputRef.current = true;
      setFocused(true);

      // Browsers set selection at the start of the input field by default. We want to set it at
      // the end for the first focus.
      const target = event.currentTarget;
      const length = target.value.length;
      target.setSelectionRange(length, length);
    },
    onBlur(event) {
      if (event.defaultPrevented || readOnly || disabled) {
        return;
      }
      setTouched(true);
      setFocused(false);
      allowInputSyncRef.current = true;
      if (inputValue.trim() === '') {
        setValue(null);
        if (validationMode === 'onBlur') {
          commitValidation(null);
        }
        return;
      }
      const formatOptions = formatOptionsRef.current;
      const parsedValue = (0,_utils_parse_js__WEBPACK_IMPORTED_MODULE_8__.parseNumber)(inputValue, locale, formatOptions);
      const canonicalText = (0,_utils_formatNumber_js__WEBPACK_IMPORTED_MODULE_13__.formatNumber)(parsedValue, locale, formatOptions);
      const maxPrecisionText = (0,_utils_formatNumber_js__WEBPACK_IMPORTED_MODULE_13__.formatNumberMaxPrecision)(parsedValue, locale, formatOptions);
      const canonical = (0,_utils_parse_js__WEBPACK_IMPORTED_MODULE_8__.parseNumber)(canonicalText, locale, formatOptions);
      const maxPrecision = (0,_utils_parse_js__WEBPACK_IMPORTED_MODULE_8__.parseNumber)(maxPrecisionText, locale, formatOptions);
      if (parsedValue === null) {
        return;
      }
      blockRevalidationRef.current = true;
      if (validationMode === 'onBlur') {
        commitValidation(canonical);
      }
      const hasExplicitPrecision = formatOptions?.maximumFractionDigits != null || formatOptions?.minimumFractionDigits != null;
      if (hasExplicitPrecision) {
        // When the consumer explicitly requests a precision, always round the number to that
        // precision and normalize the displayed text accordingly.
        if (value !== canonical) {
          setValue(canonical, event.nativeEvent);
        }
        if (inputValue !== canonicalText) {
          setInputValue(canonicalText);
        }
      } else if (value !== maxPrecision) {
        // Default behaviour: preserve max precision until it differs from canonical
        setValue(canonical, event.nativeEvent);
      } else {
        const shouldPreserveFullPrecision = parsedValue === value && inputValue === maxPrecisionText;
        if (!shouldPreserveFullPrecision && inputValue !== canonicalText) {
          setInputValue(canonicalText);
        }
      }
    },
    onChange(event) {
      // Workaround for https://github.com/facebook/react/issues/9023
      if (event.nativeEvent.defaultPrevented) {
        return;
      }
      allowInputSyncRef.current = false;
      const targetValue = event.target.value;
      if (targetValue.trim() === '') {
        setInputValue(targetValue);
        setValue(null, event.nativeEvent);
        return;
      }
      if (event.isTrusted) {
        setInputValue(targetValue);
        return;
      }
      const parsedValue = (0,_utils_parse_js__WEBPACK_IMPORTED_MODULE_8__.parseNumber)(targetValue, locale, formatOptionsRef.current);
      if (parsedValue !== null) {
        setInputValue(targetValue);
        setValue(parsedValue, event.nativeEvent);
      }
    },
    onKeyDown(event) {
      if (event.defaultPrevented || readOnly || disabled) {
        return;
      }
      const nativeEvent = event.nativeEvent;
      allowInputSyncRef.current = true;
      const allowedNonNumericKeys = getAllowedNonNumericKeys();
      let isAllowedNonNumericKey = allowedNonNumericKeys.has(event.key);
      const {
        decimal,
        currency,
        percentSign
      } = (0,_utils_parse_js__WEBPACK_IMPORTED_MODULE_8__.getNumberLocaleDetails)([], formatOptionsRef.current);
      const selectionStart = event.currentTarget.selectionStart;
      const selectionEnd = event.currentTarget.selectionEnd;
      const isAllSelected = selectionStart === 0 && selectionEnd === inputValue.length;

      // Allow the minus key only if there isn't already a plus or minus sign, or if all the text
      // is selected, or if only the minus sign is highlighted.
      if (event.key === '-' && allowedNonNumericKeys.has('-')) {
        const isMinusHighlighted = selectionStart === 0 && selectionEnd === 1 && inputValue[0] === '-';
        isAllowedNonNumericKey = !inputValue.includes('-') || isAllSelected || isMinusHighlighted;
      }

      // Only allow one of each symbol.
      [decimal, currency, percentSign].forEach(symbol => {
        if (event.key === symbol) {
          const symbolIndex = inputValue.indexOf(symbol);
          const isSymbolHighlighted = selectionStart === symbolIndex && selectionEnd === symbolIndex + 1;
          isAllowedNonNumericKey = !inputValue.includes(symbol) || isAllSelected || isSymbolHighlighted;
        }
      });
      const isLatinNumeral = /^[0-9]$/.test(event.key);
      const isArabicNumeral = _utils_parse_js__WEBPACK_IMPORTED_MODULE_8__.ARABIC_RE.test(event.key);
      const isHanNumeral = _utils_parse_js__WEBPACK_IMPORTED_MODULE_8__.HAN_RE.test(event.key);
      const isNavigateKey = NAVIGATE_KEYS.has(event.key);
      if (
      // Allow composition events (e.g., pinyin)
      // event.nativeEvent.isComposing does not work in Safari:
      // https://bugs.webkit.org/show_bug.cgi?id=165004
      event.which === 229 || event.altKey || event.ctrlKey || event.metaKey || isAllowedNonNumericKey || isLatinNumeral || isArabicNumeral || isHanNumeral || isNavigateKey) {
        return;
      }

      // We need to commit the number at this point if the input hasn't been blurred.
      const parsedValue = (0,_utils_parse_js__WEBPACK_IMPORTED_MODULE_8__.parseNumber)(inputValue, locale, formatOptionsRef.current);
      const amount = getStepAmount(event) ?? _utils_constants_js__WEBPACK_IMPORTED_MODULE_7__.DEFAULT_STEP;

      // Prevent insertion of text or caret from moving.
      (0,_floating_ui_react_utils_js__WEBPACK_IMPORTED_MODULE_2__.stopEvent)(event);
      if (event.key === 'ArrowUp') {
        incrementValue(amount, 1, parsedValue, nativeEvent);
      } else if (event.key === 'ArrowDown') {
        incrementValue(amount, -1, parsedValue, nativeEvent);
      } else if (event.key === 'Home' && min != null) {
        setValue(min, nativeEvent);
      } else if (event.key === 'End' && max != null) {
        setValue(max, nativeEvent);
      }
    },
    onPaste(event) {
      if (event.defaultPrevented || readOnly || disabled) {
        return;
      }

      // Prevent `onChange` from being called.
      event.preventDefault();
      const clipboardData = event.clipboardData || window.Clipboard;
      const pastedData = clipboardData.getData('text/plain');
      const parsedValue = (0,_utils_parse_js__WEBPACK_IMPORTED_MODULE_8__.parseNumber)(pastedData, locale, formatOptionsRef.current);
      if (parsedValue !== null) {
        allowInputSyncRef.current = false;
        setValue(parsedValue, event.nativeEvent);
        setInputValue(pastedData);
      }
    }
  };
  const element = (0,_utils_useRenderElement_js__WEBPACK_IMPORTED_MODULE_12__.useRenderElement)('input', componentProps, {
    ref: [forwardedRef, inputRef, inputValidationRef],
    state,
    props: [inputProps, getInputValidationProps(), getValidationProps(), elementProps],
    customStyleHookMapping
  });
  return element;
});
if (true) NumberFieldInput.displayName = "NumberFieldInput";

/***/ }),

/***/ "./node_modules/@base-ui-components/react/esm/number-field/root/NumberFieldRoot.js":
/*!*****************************************************************************************!*\
  !*** ./node_modules/@base-ui-components/react/esm/number-field/root/NumberFieldRoot.js ***!
  \*****************************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   NumberFieldRoot: () => (/* binding */ NumberFieldRoot)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var _base_ui_components_utils_useControlled__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @base-ui-components/utils/useControlled */ "./node_modules/@base-ui-components/utils/esm/useControlled.js");
/* harmony import */ var _base_ui_components_utils_useEventCallback__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @base-ui-components/utils/useEventCallback */ "./node_modules/@base-ui-components/utils/esm/useEventCallback.js");
/* harmony import */ var _base_ui_components_utils_useTimeout__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @base-ui-components/utils/useTimeout */ "./node_modules/@base-ui-components/utils/esm/useTimeout.js");
/* harmony import */ var _base_ui_components_utils_useInterval__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @base-ui-components/utils/useInterval */ "./node_modules/@base-ui-components/utils/esm/useInterval.js");
/* harmony import */ var _base_ui_components_utils_useIsoLayoutEffect__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @base-ui-components/utils/useIsoLayoutEffect */ "./node_modules/@base-ui-components/utils/esm/useIsoLayoutEffect.js");
/* harmony import */ var _base_ui_components_utils_useLatestRef__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @base-ui-components/utils/useLatestRef */ "./node_modules/@base-ui-components/utils/esm/useLatestRef.js");
/* harmony import */ var _base_ui_components_utils_useForcedRerendering__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @base-ui-components/utils/useForcedRerendering */ "./node_modules/@base-ui-components/utils/esm/useForcedRerendering.js");
/* harmony import */ var _base_ui_components_utils_owner__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @base-ui-components/utils/owner */ "./node_modules/@floating-ui/utils/dist/floating-ui.utils.dom.mjs");
/* harmony import */ var _base_ui_components_utils_owner__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @base-ui-components/utils/owner */ "./node_modules/@base-ui-components/utils/esm/owner.js");
/* harmony import */ var _base_ui_components_utils_detectBrowser__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! @base-ui-components/utils/detectBrowser */ "./node_modules/@base-ui-components/utils/esm/detectBrowser.js");
/* harmony import */ var _NumberFieldRootContext_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./NumberFieldRootContext.js */ "./node_modules/@base-ui-components/react/esm/number-field/root/NumberFieldRootContext.js");
/* harmony import */ var _field_root_FieldRootContext_js__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ../../field/root/FieldRootContext.js */ "./node_modules/@base-ui-components/react/esm/field/root/FieldRootContext.js");
/* harmony import */ var _utils_styleHooks_js__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ../utils/styleHooks.js */ "./node_modules/@base-ui-components/react/esm/number-field/utils/styleHooks.js");
/* harmony import */ var _utils_useRenderElement_js__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ../../utils/useRenderElement.js */ "./node_modules/@base-ui-components/react/esm/utils/useRenderElement.js");
/* harmony import */ var _utils_parse_js__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ../utils/parse.js */ "./node_modules/@base-ui-components/react/esm/number-field/utils/parse.js");
/* harmony import */ var _utils_formatNumber_js__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! ../../utils/formatNumber.js */ "./node_modules/@base-ui-components/react/esm/utils/formatNumber.js");
/* harmony import */ var _utils_useBaseUiId_js__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! ../../utils/useBaseUiId.js */ "./node_modules/@base-ui-components/react/esm/utils/useBaseUiId.js");
/* harmony import */ var _utils_constants_js__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! ../utils/constants.js */ "./node_modules/@base-ui-components/react/esm/number-field/utils/constants.js");
/* harmony import */ var _utils_validate_js__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! ../utils/validate.js */ "./node_modules/@base-ui-components/react/esm/number-field/utils/validate.js");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
'use client';





















/**
 * Groups all parts of the number field and manages its state.
 * Renders a `<div>` element.
 *
 * Documentation: [Base UI Number Field](https://base-ui.com/react/components/number-field)
 */
const NumberFieldRoot = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.forwardRef(function NumberFieldRoot(componentProps, forwardedRef) {
  const {
    id: idProp,
    min,
    max,
    smallStep = 0.1,
    step = 1,
    largeStep = 10,
    required = false,
    disabled: disabledProp = false,
    readOnly = false,
    name: nameProp,
    defaultValue,
    value: valueProp,
    onValueChange: onValueChangeProp,
    allowWheelScrub = false,
    snapOnStep = false,
    format,
    locale,
    render,
    className,
    inputRef: inputRefProp,
    ...elementProps
  } = componentProps;
  const {
    setControlId,
    setDirty,
    validityData,
    setValidityData,
    disabled: fieldDisabled,
    setFilled,
    invalid,
    name: fieldName,
    state: fieldState
  } = (0,_field_root_FieldRootContext_js__WEBPACK_IMPORTED_MODULE_12__.useFieldRootContext)();
  const disabled = fieldDisabled || disabledProp;
  const name = fieldName ?? nameProp;
  const [isScrubbing, setIsScrubbing] = react__WEBPACK_IMPORTED_MODULE_0__.useState(false);
  const minWithDefault = min ?? Number.MIN_SAFE_INTEGER;
  const maxWithDefault = max ?? Number.MAX_SAFE_INTEGER;
  const minWithZeroDefault = min ?? 0;
  const formatStyle = format?.style;
  const inputRef = react__WEBPACK_IMPORTED_MODULE_0__.useRef(null);
  const id = (0,_utils_useBaseUiId_js__WEBPACK_IMPORTED_MODULE_17__.useBaseUiId)(idProp);
  (0,_base_ui_components_utils_useIsoLayoutEffect__WEBPACK_IMPORTED_MODULE_5__.useIsoLayoutEffect)(() => {
    setControlId(id);
    return () => {
      setControlId(undefined);
    };
  }, [id, setControlId]);
  const [valueUnwrapped, setValueUnwrapped] = (0,_base_ui_components_utils_useControlled__WEBPACK_IMPORTED_MODULE_1__.useControlled)({
    controlled: valueProp,
    default: defaultValue,
    name: 'NumberField',
    state: 'value'
  });
  const value = valueUnwrapped ?? null;
  const valueRef = (0,_base_ui_components_utils_useLatestRef__WEBPACK_IMPORTED_MODULE_6__.useLatestRef)(value);
  (0,_base_ui_components_utils_useIsoLayoutEffect__WEBPACK_IMPORTED_MODULE_5__.useIsoLayoutEffect)(() => {
    setFilled(value !== null);
  }, [setFilled, value]);
  const forceRender = (0,_base_ui_components_utils_useForcedRerendering__WEBPACK_IMPORTED_MODULE_7__.useForcedRerendering)();
  const formatOptionsRef = (0,_base_ui_components_utils_useLatestRef__WEBPACK_IMPORTED_MODULE_6__.useLatestRef)(format);
  const onValueChange = (0,_base_ui_components_utils_useEventCallback__WEBPACK_IMPORTED_MODULE_2__.useEventCallback)(onValueChangeProp);
  const startTickTimeout = (0,_base_ui_components_utils_useTimeout__WEBPACK_IMPORTED_MODULE_3__.useTimeout)();
  const tickInterval = (0,_base_ui_components_utils_useInterval__WEBPACK_IMPORTED_MODULE_4__.useInterval)();
  const intentionalTouchCheckTimeout = (0,_base_ui_components_utils_useTimeout__WEBPACK_IMPORTED_MODULE_3__.useTimeout)();
  const isPressedRef = react__WEBPACK_IMPORTED_MODULE_0__.useRef(false);
  const movesAfterTouchRef = react__WEBPACK_IMPORTED_MODULE_0__.useRef(0);
  const allowInputSyncRef = react__WEBPACK_IMPORTED_MODULE_0__.useRef(true);
  const unsubscribeFromGlobalContextMenuRef = react__WEBPACK_IMPORTED_MODULE_0__.useRef(() => {});
  (0,_base_ui_components_utils_useIsoLayoutEffect__WEBPACK_IMPORTED_MODULE_5__.useIsoLayoutEffect)(() => {
    if (validityData.initialValue === null && value !== validityData.initialValue) {
      setValidityData(prev => ({
        ...prev,
        initialValue: value
      }));
    }
  }, [setValidityData, validityData.initialValue, value]);

  // During SSR, the value is formatted on the server, whose locale may differ from the client's
  // locale. This causes a hydration mismatch, which we manually suppress. This is preferable to
  // rendering an empty input field and then updating it with the formatted value, as the user
  // can still see the value prior to hydration, even if it's not formatted correctly.
  const [inputValue, setInputValue] = react__WEBPACK_IMPORTED_MODULE_0__.useState(() => {
    if (valueProp !== undefined) {
      return getControlledInputValue(value, locale, format);
    }
    return (0,_utils_formatNumber_js__WEBPACK_IMPORTED_MODULE_16__.formatNumber)(value, locale, format);
  });
  const [inputMode, setInputMode] = react__WEBPACK_IMPORTED_MODULE_0__.useState('numeric');
  const getAllowedNonNumericKeys = (0,_base_ui_components_utils_useEventCallback__WEBPACK_IMPORTED_MODULE_2__.useEventCallback)(() => {
    const {
      decimal,
      group,
      currency
    } = (0,_utils_parse_js__WEBPACK_IMPORTED_MODULE_15__.getNumberLocaleDetails)(locale, format);
    const keys = new Set(['.', ',', decimal, group]);
    if (formatStyle === 'percent') {
      _utils_parse_js__WEBPACK_IMPORTED_MODULE_15__.PERCENTAGES.forEach(key => keys.add(key));
    }
    if (formatStyle === 'currency' && currency) {
      keys.add(currency);
    }
    if (minWithDefault < 0) {
      keys.add('-');
    }
    return keys;
  });
  const getStepAmount = (0,_base_ui_components_utils_useEventCallback__WEBPACK_IMPORTED_MODULE_2__.useEventCallback)(event => {
    if (event?.altKey) {
      return smallStep;
    }
    if (event?.shiftKey) {
      return largeStep;
    }
    return step;
  });
  const setValue = (0,_base_ui_components_utils_useEventCallback__WEBPACK_IMPORTED_MODULE_2__.useEventCallback)((unvalidatedValue, event, dir) => {
    const eventWithOptionalKeyState = event;
    const validatedValue = (0,_utils_validate_js__WEBPACK_IMPORTED_MODULE_19__.toValidatedNumber)(unvalidatedValue, {
      step: dir ? getStepAmount(eventWithOptionalKeyState) * dir : undefined,
      format: formatOptionsRef.current,
      minWithDefault,
      maxWithDefault,
      minWithZeroDefault,
      snapOnStep,
      small: eventWithOptionalKeyState?.altKey ?? false
    });
    onValueChange?.(validatedValue, event && 'nativeEvent' in event ? event.nativeEvent : event);
    setValueUnwrapped(validatedValue);
    setDirty(validatedValue !== validityData.initialValue);

    // Keep the visible input in sync immediately when programmatic changes occur
    // (increment/decrement, wheel, etc). During direct typing we don't want
    // to overwrite the user-provided text until blur, so we gate on
    // `allowInputSyncRef`.
    if (allowInputSyncRef.current) {
      setInputValue((0,_utils_formatNumber_js__WEBPACK_IMPORTED_MODULE_16__.formatNumber)(validatedValue, locale, format));
    }

    // Formatting can change even if the numeric value hasn't, so ensure a re-render when needed.
    forceRender();
  });
  const incrementValue = (0,_base_ui_components_utils_useEventCallback__WEBPACK_IMPORTED_MODULE_2__.useEventCallback)((amount, dir, currentValue, event) => {
    const prevValue = currentValue == null ? valueRef.current : currentValue;
    const nextValue = typeof prevValue === 'number' ? prevValue + amount * dir : Math.max(0, min ?? 0);
    setValue(nextValue, event, dir);
  });
  const stopAutoChange = (0,_base_ui_components_utils_useEventCallback__WEBPACK_IMPORTED_MODULE_2__.useEventCallback)(() => {
    intentionalTouchCheckTimeout.clear();
    startTickTimeout.clear();
    tickInterval.clear();
    unsubscribeFromGlobalContextMenuRef.current();
    movesAfterTouchRef.current = 0;
  });
  const startAutoChange = (0,_base_ui_components_utils_useEventCallback__WEBPACK_IMPORTED_MODULE_2__.useEventCallback)((isIncrement, triggerEvent) => {
    stopAutoChange();
    if (!inputRef.current) {
      return;
    }
    const win = (0,_base_ui_components_utils_owner__WEBPACK_IMPORTED_MODULE_8__.getWindow)(inputRef.current);
    function handleContextMenu(event) {
      event.preventDefault();
    }

    // A global context menu is necessary to prevent the context menu from appearing when the touch
    // is slightly outside of the element's hit area.
    win.addEventListener('contextmenu', handleContextMenu);
    unsubscribeFromGlobalContextMenuRef.current = () => {
      win.removeEventListener('contextmenu', handleContextMenu);
    };
    win.addEventListener('pointerup', () => {
      isPressedRef.current = false;
      stopAutoChange();
    }, {
      once: true
    });
    function tick() {
      const amount = getStepAmount(triggerEvent) ?? _utils_constants_js__WEBPACK_IMPORTED_MODULE_18__.DEFAULT_STEP;
      incrementValue(amount, isIncrement ? 1 : -1, undefined, triggerEvent);
    }
    tick();
    startTickTimeout.start(_utils_constants_js__WEBPACK_IMPORTED_MODULE_18__.START_AUTO_CHANGE_DELAY, () => {
      tickInterval.start(_utils_constants_js__WEBPACK_IMPORTED_MODULE_18__.CHANGE_VALUE_TICK_DELAY, tick);
    });
  });

  // We need to update the input value when the external `value` prop changes. This ends up acting
  // as a single source of truth to update the input value, bypassing the need to manually set it in
  // each event handler internally in this hook.
  // This is done inside a layout effect as an alternative to the technique to set state during
  // render as we're accessing a ref, which must be inside an effect.
  // https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
  //
  // ESLint is disabled because it needs to run even if the parsed value hasn't changed, since the
  // value still can be formatted differently.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  (0,_base_ui_components_utils_useIsoLayoutEffect__WEBPACK_IMPORTED_MODULE_5__.useIsoLayoutEffect)(function syncFormattedInputValueOnValueChange() {
    // This ensures the value is only updated on blur rather than every keystroke, but still
    // allows the input value to be updated when the value is changed externally.
    if (!allowInputSyncRef.current) {
      return;
    }
    const nextInputValue = valueProp !== undefined ? getControlledInputValue(value, locale, format) : (0,_utils_formatNumber_js__WEBPACK_IMPORTED_MODULE_16__.formatNumber)(value, locale, format);
    if (nextInputValue !== inputValue) {
      setInputValue(nextInputValue);
    }
  });
  (0,_base_ui_components_utils_useIsoLayoutEffect__WEBPACK_IMPORTED_MODULE_5__.useIsoLayoutEffect)(function setDynamicInputModeForIOS() {
    if (!_base_ui_components_utils_detectBrowser__WEBPACK_IMPORTED_MODULE_10__.isIOS) {
      return;
    }

    // iOS numeric software keyboard doesn't have a minus key, so we need to use the default
    // keyboard to let the user input a negative number.
    let computedInputMode = 'text';
    if (minWithDefault >= 0) {
      // iOS numeric software keyboard doesn't have a decimal key for "numeric" input mode, but
      // this is better than the "text" input if possible to use.
      computedInputMode = 'decimal';
    }
    setInputMode(computedInputMode);
  }, [minWithDefault, formatStyle]);
  react__WEBPACK_IMPORTED_MODULE_0__.useEffect(() => {
    return () => stopAutoChange();
  }, [stopAutoChange]);

  // The `onWheel` prop can't be prevented, so we need to use a global event listener.
  react__WEBPACK_IMPORTED_MODULE_0__.useEffect(function registerElementWheelListener() {
    const element = inputRef.current;
    if (disabled || readOnly || !allowWheelScrub || !element) {
      return undefined;
    }
    function handleWheel(event) {
      if (
      // Allow pinch-zooming.
      event.ctrlKey || (0,_base_ui_components_utils_owner__WEBPACK_IMPORTED_MODULE_9__.ownerDocument)(inputRef.current).activeElement !== inputRef.current) {
        return;
      }

      // Prevent the default behavior to avoid scrolling the page.
      event.preventDefault();
      const amount = getStepAmount(event) ?? _utils_constants_js__WEBPACK_IMPORTED_MODULE_18__.DEFAULT_STEP;
      incrementValue(amount, event.deltaY > 0 ? -1 : 1, undefined, event);
    }
    element.addEventListener('wheel', handleWheel);
    return () => {
      element.removeEventListener('wheel', handleWheel);
    };
  }, [allowWheelScrub, incrementValue, disabled, readOnly, largeStep, step, getStepAmount]);
  const state = react__WEBPACK_IMPORTED_MODULE_0__.useMemo(() => ({
    ...fieldState,
    disabled,
    readOnly,
    required,
    value,
    inputValue,
    scrubbing: isScrubbing
  }), [fieldState, disabled, readOnly, required, value, inputValue, isScrubbing]);
  const contextValue = react__WEBPACK_IMPORTED_MODULE_0__.useMemo(() => ({
    inputRef,
    inputValue,
    value,
    startAutoChange,
    stopAutoChange,
    minWithDefault,
    maxWithDefault,
    disabled,
    readOnly,
    id,
    setValue,
    incrementValue,
    getStepAmount,
    allowInputSyncRef,
    formatOptionsRef,
    valueRef,
    isPressedRef,
    intentionalTouchCheckTimeout,
    movesAfterTouchRef,
    name,
    required,
    invalid,
    inputMode,
    getAllowedNonNumericKeys,
    min,
    max,
    setInputValue,
    locale,
    isScrubbing,
    setIsScrubbing,
    state
  }), [inputRef, inputValue, value, startAutoChange, stopAutoChange, minWithDefault, maxWithDefault, disabled, readOnly, id, setValue, incrementValue, getStepAmount, allowInputSyncRef, formatOptionsRef, valueRef, isPressedRef, intentionalTouchCheckTimeout, movesAfterTouchRef, name, required, invalid, inputMode, getAllowedNonNumericKeys, min, max, setInputValue, locale, isScrubbing, state]);
  const element = (0,_utils_useRenderElement_js__WEBPACK_IMPORTED_MODULE_14__.useRenderElement)('div', componentProps, {
    ref: forwardedRef,
    state,
    props: elementProps,
    customStyleHookMapping: _utils_styleHooks_js__WEBPACK_IMPORTED_MODULE_13__.styleHookMapping
  });
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_20__.jsxs)(_NumberFieldRootContext_js__WEBPACK_IMPORTED_MODULE_11__.NumberFieldRootContext.Provider, {
    value: contextValue,
    children: [element, name && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_20__.jsx)("input", {
      type: "hidden",
      name: name,
      ref: inputRefProp,
      value: value ?? '',
      disabled: disabled,
      required: required
    })]
  });
});
if (true) NumberFieldRoot.displayName = "NumberFieldRoot";
function getControlledInputValue(value, locale, format) {
  const explicitPrecision = format?.maximumFractionDigits != null || format?.minimumFractionDigits != null;
  return explicitPrecision ? (0,_utils_formatNumber_js__WEBPACK_IMPORTED_MODULE_16__.formatNumber)(value, locale, format) : (0,_utils_formatNumber_js__WEBPACK_IMPORTED_MODULE_16__.formatNumberMaxPrecision)(value, locale, format);
}

/***/ }),

/***/ "./node_modules/@base-ui-components/react/esm/number-field/root/NumberFieldRootContext.js":
/*!************************************************************************************************!*\
  !*** ./node_modules/@base-ui-components/react/esm/number-field/root/NumberFieldRootContext.js ***!
  \************************************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   NumberFieldRootContext: () => (/* binding */ NumberFieldRootContext),
/* harmony export */   useNumberFieldRootContext: () => (/* binding */ useNumberFieldRootContext)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
'use client';


const NumberFieldRootContext = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createContext(undefined);
if (true) NumberFieldRootContext.displayName = "NumberFieldRootContext";
function useNumberFieldRootContext() {
  const context = react__WEBPACK_IMPORTED_MODULE_0__.useContext(NumberFieldRootContext);
  if (context === undefined) {
    throw new Error('Base UI: NumberFieldRootContext is missing. NumberField parts must be placed within <NumberField.Root>.');
  }
  return context;
}

/***/ }),

/***/ "./node_modules/@base-ui-components/react/esm/number-field/root/useNumberFieldButton.js":
/*!**********************************************************************************************!*\
  !*** ./node_modules/@base-ui-components/react/esm/number-field/root/useNumberFieldButton.js ***!
  \**********************************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   useNumberFieldButton: () => (/* binding */ useNumberFieldButton)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var _base_ui_components_utils_useEventCallback__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @base-ui-components/utils/useEventCallback */ "./node_modules/@base-ui-components/utils/esm/useEventCallback.js");
/* harmony import */ var _utils_constants_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils/constants.js */ "./node_modules/@base-ui-components/react/esm/number-field/utils/constants.js");
/* harmony import */ var _utils_parse_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../utils/parse.js */ "./node_modules/@base-ui-components/react/esm/number-field/utils/parse.js");
'use client';





function useNumberFieldButton(params) {
  const {
    allowInputSyncRef,
    disabled,
    formatOptionsRef,
    getStepAmount,
    id,
    incrementValue,
    inputRef,
    inputValue,
    intentionalTouchCheckTimeout,
    isIncrement,
    isPressedRef,
    locale,
    maxWithDefault,
    minWithDefault,
    movesAfterTouchRef,
    readOnly,
    setValue,
    startAutoChange,
    stopAutoChange,
    value,
    valueRef
  } = params;
  const incrementDownCoordsRef = react__WEBPACK_IMPORTED_MODULE_0__.useRef({
    x: 0,
    y: 0
  });
  const isTouchingButtonRef = react__WEBPACK_IMPORTED_MODULE_0__.useRef(false);
  const ignoreClickRef = react__WEBPACK_IMPORTED_MODULE_0__.useRef(false);
  const pointerTypeRef = react__WEBPACK_IMPORTED_MODULE_0__.useRef('');
  const isMin = value != null && value <= minWithDefault;
  const isMax = value != null && value >= maxWithDefault;
  const commitValue = (0,_base_ui_components_utils_useEventCallback__WEBPACK_IMPORTED_MODULE_1__.useEventCallback)(nativeEvent => {
    allowInputSyncRef.current = true;

    // The input may be dirty but not yet blurred, so the value won't have been committed.
    const parsedValue = (0,_utils_parse_js__WEBPACK_IMPORTED_MODULE_3__.parseNumber)(inputValue, locale, formatOptionsRef.current);
    if (parsedValue !== null) {
      // The increment value function needs to know the current input value to increment it
      // correctly.
      valueRef.current = parsedValue;
      setValue(parsedValue, nativeEvent);
    }
  });
  const props = react__WEBPACK_IMPORTED_MODULE_0__.useMemo(() => ({
    disabled: disabled || (isIncrement ? isMax : isMin),
    'aria-readonly': readOnly || undefined,
    'aria-label': isIncrement ? 'Increase' : 'Decrease',
    'aria-controls': id,
    // Keyboard users shouldn't have access to the buttons, since they can use the input element
    // to change the value. On the other hand, `aria-hidden` is not applied because touch screen
    // readers should be able to use the buttons.
    tabIndex: -1,
    style: {
      WebkitUserSelect: 'none',
      userSelect: 'none'
    },
    onTouchStart() {
      isTouchingButtonRef.current = true;
    },
    onTouchEnd() {
      isTouchingButtonRef.current = false;
    },
    onClick(event) {
      const isDisabled = disabled || readOnly || (isIncrement ? isMax : isMin);
      if (event.defaultPrevented || isDisabled || (
      // If it's not a keyboard/virtual click, ignore.
      pointerTypeRef.current === 'touch' ? ignoreClickRef.current : event.detail !== 0)) {
        return;
      }
      commitValue(event.nativeEvent);
      const amount = getStepAmount(event) ?? _utils_constants_js__WEBPACK_IMPORTED_MODULE_2__.DEFAULT_STEP;
      incrementValue(amount, isIncrement ? 1 : -1, undefined, event.nativeEvent);
    },
    onPointerDown(event) {
      const isMainButton = !event.button || event.button === 0;
      const isDisabled = disabled || (isIncrement ? isMax : isMin);
      if (event.defaultPrevented || readOnly || !isMainButton || isDisabled) {
        return;
      }
      pointerTypeRef.current = event.pointerType;
      ignoreClickRef.current = false;
      isPressedRef.current = true;
      incrementDownCoordsRef.current = {
        x: event.clientX,
        y: event.clientY
      };
      commitValue(event.nativeEvent);

      // Note: "pen" is sometimes returned for mouse usage on Linux Chrome.
      if (event.pointerType !== 'touch') {
        event.preventDefault();
        inputRef.current?.focus();
        startAutoChange(isIncrement, event);
      } else {
        // We need to check if the pointerdown was intentional, and not the result of a scroll
        // or pinch-zoom. In that case, we don't want to change the value.
        intentionalTouchCheckTimeout.start(_utils_constants_js__WEBPACK_IMPORTED_MODULE_2__.TOUCH_TIMEOUT, () => {
          const moves = movesAfterTouchRef.current;
          movesAfterTouchRef.current = 0;
          if (moves != null && moves < _utils_constants_js__WEBPACK_IMPORTED_MODULE_2__.MAX_POINTER_MOVES_AFTER_TOUCH) {
            ignoreClickRef.current = true;
            startAutoChange(isIncrement, event);
          } else {
            stopAutoChange();
          }
        });
      }
    },
    onPointerMove(event) {
      const isDisabled = disabled || readOnly || (isIncrement ? isMax : isMin);
      if (isDisabled || event.pointerType !== 'touch' || !isPressedRef.current) {
        return;
      }
      if (movesAfterTouchRef.current != null) {
        movesAfterTouchRef.current += 1;
      }
      const {
        x,
        y
      } = incrementDownCoordsRef.current;
      const dx = x - event.clientX;
      const dy = y - event.clientY;

      // An alternative to this technique is to detect when the NumberField's parent container
      // has been scrolled
      if (dx ** 2 + dy ** 2 > _utils_constants_js__WEBPACK_IMPORTED_MODULE_2__.SCROLLING_POINTER_MOVE_DISTANCE ** 2) {
        stopAutoChange();
      }
    },
    onMouseEnter(event) {
      const isDisabled = disabled || readOnly || (isIncrement ? isMax : isMin);
      if (event.defaultPrevented || isDisabled || !isPressedRef.current || isTouchingButtonRef.current) {
        return;
      }
      startAutoChange(isIncrement, event);
    },
    onMouseLeave() {
      if (isTouchingButtonRef.current) {
        return;
      }
      stopAutoChange();
    },
    onMouseUp() {
      if (isTouchingButtonRef.current) {
        return;
      }
      stopAutoChange();
    }
  }), [commitValue, disabled, getStepAmount, id, incrementValue, inputRef, isIncrement, intentionalTouchCheckTimeout, isMax, isMin, isPressedRef, movesAfterTouchRef, readOnly, startAutoChange, stopAutoChange]);
  return react__WEBPACK_IMPORTED_MODULE_0__.useMemo(() => ({
    props
  }), [props]);
}

/***/ }),

/***/ "./node_modules/@base-ui-components/react/esm/number-field/utils/constants.js":
/*!************************************************************************************!*\
  !*** ./node_modules/@base-ui-components/react/esm/number-field/utils/constants.js ***!
  \************************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   CHANGE_VALUE_TICK_DELAY: () => (/* binding */ CHANGE_VALUE_TICK_DELAY),
/* harmony export */   DEFAULT_STEP: () => (/* binding */ DEFAULT_STEP),
/* harmony export */   MAX_POINTER_MOVES_AFTER_TOUCH: () => (/* binding */ MAX_POINTER_MOVES_AFTER_TOUCH),
/* harmony export */   SCROLLING_POINTER_MOVE_DISTANCE: () => (/* binding */ SCROLLING_POINTER_MOVE_DISTANCE),
/* harmony export */   START_AUTO_CHANGE_DELAY: () => (/* binding */ START_AUTO_CHANGE_DELAY),
/* harmony export */   TOUCH_TIMEOUT: () => (/* binding */ TOUCH_TIMEOUT)
/* harmony export */ });
const CHANGE_VALUE_TICK_DELAY = 60;
const START_AUTO_CHANGE_DELAY = 400;
const TOUCH_TIMEOUT = 50;
const MAX_POINTER_MOVES_AFTER_TOUCH = 3;
const SCROLLING_POINTER_MOVE_DISTANCE = 8;
const DEFAULT_STEP = 1;

/***/ }),

/***/ "./node_modules/@base-ui-components/react/esm/number-field/utils/parse.js":
/*!********************************************************************************!*\
  !*** ./node_modules/@base-ui-components/react/esm/number-field/utils/parse.js ***!
  \********************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ARABIC_NUMERALS: () => (/* binding */ ARABIC_NUMERALS),
/* harmony export */   ARABIC_RE: () => (/* binding */ ARABIC_RE),
/* harmony export */   HAN_NUMERALS: () => (/* binding */ HAN_NUMERALS),
/* harmony export */   HAN_RE: () => (/* binding */ HAN_RE),
/* harmony export */   PERCENTAGES: () => (/* binding */ PERCENTAGES),
/* harmony export */   PERCENT_RE: () => (/* binding */ PERCENT_RE),
/* harmony export */   getNumberLocaleDetails: () => (/* binding */ getNumberLocaleDetails),
/* harmony export */   parseNumber: () => (/* binding */ parseNumber)
/* harmony export */ });
/* harmony import */ var _utils_formatNumber_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../utils/formatNumber.js */ "./node_modules/@base-ui-components/react/esm/utils/formatNumber.js");

const HAN_NUMERALS = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
const ARABIC_NUMERALS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
const PERCENTAGES = ['%', '٪'];
const ARABIC_RE = new RegExp(`[${ARABIC_NUMERALS.join('')}]`, 'g');
const HAN_RE = new RegExp(`[${HAN_NUMERALS.join('')}]`, 'g');
const PERCENT_RE = new RegExp(`[${PERCENTAGES.join('')}]`);
function getNumberLocaleDetails(locale, options) {
  const parts = (0,_utils_formatNumber_js__WEBPACK_IMPORTED_MODULE_0__.getFormatter)(locale, options).formatToParts(11111.1);
  const result = {};
  parts.forEach(part => {
    result[part.type] = part.value;
  });

  // The formatting options may result in not returning a decimal.
  (0,_utils_formatNumber_js__WEBPACK_IMPORTED_MODULE_0__.getFormatter)(locale).formatToParts(0.1).forEach(part => {
    if (part.type === 'decimal') {
      result[part.type] = part.value;
    }
  });
  return result;
}
function parseNumber(formattedNumber, locale, options) {
  let computedLocale = locale;
  if (computedLocale === undefined) {
    if (ARABIC_RE.test(formattedNumber)) {
      computedLocale = 'ar';
    } else if (HAN_RE.test(formattedNumber)) {
      computedLocale = 'zh';
    }
  }
  const {
    group,
    decimal,
    currency,
    unit
  } = getNumberLocaleDetails(computedLocale, options);
  let groupRegex = null;
  if (group) {
    // Check if the group separator is a space-like character.
    // If so, we'll replace all such characters with an empty string.
    groupRegex = /\p{Zs}/u.test(group) ? /\p{Zs}/gu : new RegExp(`\\${group}`, 'g');
  }
  const regexesToReplace = [{
    regex: group ? groupRegex : null,
    replacement: ''
  }, {
    regex: decimal ? new RegExp(`\\${decimal}`, 'g') : null,
    replacement: '.'
  }, {
    regex: currency ? new RegExp(`\\${currency}`, 'g') : null,
    replacement: ''
  }, {
    regex: unit ? new RegExp(`\\${unit}`, 'g') : null,
    replacement: ''
  }, {
    regex: ARABIC_RE,
    replacement: match => ARABIC_NUMERALS.indexOf(match).toString()
  }, {
    regex: HAN_RE,
    replacement: match => HAN_NUMERALS.indexOf(match).toString()
  }];
  const unformattedNumber = regexesToReplace.reduce((acc, {
    regex,
    replacement
  }) => {
    if (!regex) {
      return acc;
    }
    return acc.replace(regex, replacement);
  }, formattedNumber);
  let num = parseFloat(unformattedNumber);
  const style = options?.style;
  const isUnitPercent = style === 'unit' && options?.unit === 'percent';
  const isPercent = PERCENT_RE.test(formattedNumber) || style === 'percent';
  if (!isUnitPercent && isPercent) {
    num /= 100;
  }
  if (Number.isNaN(num)) {
    return null;
  }
  return num;
}

/***/ }),

/***/ "./node_modules/@base-ui-components/react/esm/number-field/utils/styleHooks.js":
/*!*************************************************************************************!*\
  !*** ./node_modules/@base-ui-components/react/esm/number-field/utils/styleHooks.js ***!
  \*************************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   styleHookMapping: () => (/* binding */ styleHookMapping)
/* harmony export */ });
const styleHookMapping = {
  inputValue: () => null,
  value: () => null
};

/***/ }),

/***/ "./node_modules/@base-ui-components/react/esm/number-field/utils/validate.js":
/*!***********************************************************************************!*\
  !*** ./node_modules/@base-ui-components/react/esm/number-field/utils/validate.js ***!
  \***********************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   removeFloatingPointErrors: () => (/* binding */ removeFloatingPointErrors),
/* harmony export */   toValidatedNumber: () => (/* binding */ toValidatedNumber)
/* harmony export */ });
/* harmony import */ var _utils_formatNumber_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../utils/formatNumber.js */ "./node_modules/@base-ui-components/react/esm/utils/formatNumber.js");
/* harmony import */ var _utils_clamp_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../utils/clamp.js */ "./node_modules/@base-ui-components/react/esm/utils/clamp.js");


function removeFloatingPointErrors(value, format = {}) {
  return parseFloat((0,_utils_formatNumber_js__WEBPACK_IMPORTED_MODULE_0__.getFormatter)('en-US', {
    maximumFractionDigits: format.maximumFractionDigits,
    minimumFractionDigits: format.minimumFractionDigits,
    useGrouping: false
  }).format(value));
}
function toValidatedNumber(value, {
  step,
  minWithDefault,
  maxWithDefault,
  minWithZeroDefault,
  format,
  snapOnStep,
  small
}) {
  if (value === null) {
    return value;
  }
  const clampedValue = (0,_utils_clamp_js__WEBPACK_IMPORTED_MODULE_1__.clamp)(value, minWithDefault, maxWithDefault);
  if (step != null && snapOnStep) {
    if (small) {
      const stepsFromMin = (clampedValue - minWithZeroDefault) / step;
      const roundedSteps = Math.round(stepsFromMin);
      const snappedValue = minWithZeroDefault + roundedSteps * step;
      return removeFloatingPointErrors(snappedValue, format);
    }

    // If a real minimum is provided, use it
    const base = minWithDefault !== Number.MIN_SAFE_INTEGER ? minWithDefault : minWithZeroDefault;
    if (step > 0) {
      // "Undo" the increment by subtracting step, then snap.
      const unsnapped = clampedValue - step;
      const steps = Math.floor((unsnapped - base) / step);
      // Reapply the increment by adding step
      return removeFloatingPointErrors(base + steps * step + step, format);
    }
    if (step < 0) {
      const absStep = Math.abs(step);
      const unsnapped = clampedValue - step;
      const steps = Math.ceil((unsnapped - base) / absStep);
      return removeFloatingPointErrors(base + steps * absStep + step, format);
    }
  }
  return removeFloatingPointErrors(clampedValue, format);
}

/***/ }),

/***/ "./node_modules/@base-ui-components/react/esm/use-button/useButton.js":
/*!****************************************************************************!*\
  !*** ./node_modules/@base-ui-components/react/esm/use-button/useButton.js ***!
  \****************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   useButton: () => (/* binding */ useButton)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var _base_ui_components_utils_useEventCallback__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @base-ui-components/utils/useEventCallback */ "./node_modules/@base-ui-components/utils/esm/useEventCallback.js");
/* harmony import */ var _base_ui_components_utils_error__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @base-ui-components/utils/error */ "./node_modules/@base-ui-components/utils/esm/error.js");
/* harmony import */ var _base_ui_components_utils_useIsoLayoutEffect__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @base-ui-components/utils/useIsoLayoutEffect */ "./node_modules/@base-ui-components/utils/esm/useIsoLayoutEffect.js");
/* harmony import */ var _merge_props_index_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../merge-props/index.js */ "./node_modules/@base-ui-components/react/esm/merge-props/mergeProps.js");
/* harmony import */ var _composite_root_CompositeRootContext_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../composite/root/CompositeRootContext.js */ "./node_modules/@base-ui-components/react/esm/composite/root/CompositeRootContext.js");
/* harmony import */ var _utils_useFocusableWhenDisabled_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../utils/useFocusableWhenDisabled.js */ "./node_modules/@base-ui-components/react/esm/utils/useFocusableWhenDisabled.js");
'use client';








function useButton(parameters = {}) {
  const {
    disabled = false,
    focusableWhenDisabled,
    tabIndex = 0,
    native: isNativeButton = true
  } = parameters;
  const buttonRef = react__WEBPACK_IMPORTED_MODULE_0__.useRef(null);
  const isCompositeItem = (0,_composite_root_CompositeRootContext_js__WEBPACK_IMPORTED_MODULE_5__.useCompositeRootContext)(true) !== undefined;
  const isValidLink = (0,_base_ui_components_utils_useEventCallback__WEBPACK_IMPORTED_MODULE_1__.useEventCallback)(() => {
    const element = buttonRef.current;
    return Boolean(element?.tagName === 'A' && element?.href);
  });
  const {
    props: focusableWhenDisabledProps
  } = (0,_utils_useFocusableWhenDisabled_js__WEBPACK_IMPORTED_MODULE_6__.useFocusableWhenDisabled)({
    focusableWhenDisabled,
    disabled,
    composite: isCompositeItem,
    tabIndex,
    isNativeButton
  });
  if (true) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    react__WEBPACK_IMPORTED_MODULE_0__.useEffect(() => {
      if (!buttonRef.current) {
        return;
      }
      const isButtonTag = buttonRef.current.tagName === 'BUTTON';
      if (isNativeButton) {
        if (!isButtonTag) {
          (0,_base_ui_components_utils_error__WEBPACK_IMPORTED_MODULE_2__.error)('A component that acts as a button was not rendered as a native <button>, which does not match the default. Ensure that the element passed to the `render` prop of the component is a real <button>, or set the `nativeButton` prop on the component to `false`.');
        }
      } else if (isButtonTag) {
        (0,_base_ui_components_utils_error__WEBPACK_IMPORTED_MODULE_2__.error)('A component that acts as a button was rendered as a native <button>, which does not match the default. Ensure that the element passed to the `render` prop of the component is not a real <button>, or set the `nativeButton` prop on the component to `true`.');
      }
    }, [isNativeButton]);
  }

  // handles a disabled composite button rendering another button, e.g.
  // <Toolbar.Button disabled render={<Menu.Trigger />} />
  // the `disabled` prop needs to pass through 2 `useButton`s then finally
  // delete the `disabled` attribute from DOM
  (0,_base_ui_components_utils_useIsoLayoutEffect__WEBPACK_IMPORTED_MODULE_3__.useIsoLayoutEffect)(() => {
    const element = buttonRef.current;
    if (!(element instanceof HTMLButtonElement)) {
      return;
    }
    if (isCompositeItem && disabled && focusableWhenDisabledProps.disabled === undefined && element.disabled) {
      element.disabled = false;
    }
  }, [disabled, focusableWhenDisabledProps.disabled, isCompositeItem]);
  const getButtonProps = react__WEBPACK_IMPORTED_MODULE_0__.useCallback((externalProps = {}) => {
    const {
      onClick: externalOnClick,
      onMouseDown: externalOnMouseDown,
      onKeyUp: externalOnKeyUp,
      onKeyDown: externalOnKeyDown,
      onPointerDown: externalOnPointerDown,
      ...otherExternalProps
    } = externalProps;
    const type = isNativeButton ? 'button' : undefined;
    return (0,_merge_props_index_js__WEBPACK_IMPORTED_MODULE_4__.mergeProps)({
      type,
      onClick(event) {
        if (disabled) {
          event.preventDefault();
          return;
        }
        externalOnClick?.(event);
      },
      onMouseDown(event) {
        if (!disabled) {
          externalOnMouseDown?.(event);
        }
      },
      onKeyDown(event) {
        if (!disabled) {
          (0,_merge_props_index_js__WEBPACK_IMPORTED_MODULE_4__.makeEventPreventable)(event);
          externalOnKeyDown?.(event);
        }
        if (event.baseUIHandlerPrevented) {
          return;
        }
        const shouldClick = event.target === event.currentTarget && !isNativeButton && !isValidLink() && !disabled;
        const isEnterKey = event.key === 'Enter';
        const isSpaceKey = event.key === ' ';

        // Keyboard accessibility for non interactive elements
        if (shouldClick) {
          if (isSpaceKey || isEnterKey) {
            event.preventDefault();
          }
          if (isEnterKey) {
            externalOnClick?.(event);
          }
        }
      },
      onKeyUp(event) {
        // calling preventDefault in keyUp on a <button> will not dispatch a click event if Space is pressed
        // https://codesandbox.io/p/sandbox/button-keyup-preventdefault-dn7f0
        // Keyboard accessibility for non interactive elements
        if (!disabled) {
          (0,_merge_props_index_js__WEBPACK_IMPORTED_MODULE_4__.makeEventPreventable)(event);
          externalOnKeyUp?.(event);
        }
        if (event.baseUIHandlerPrevented) {
          return;
        }
        if (event.target === event.currentTarget && !isNativeButton && !disabled && event.key === ' ') {
          externalOnClick?.(event);
        }
      },
      onPointerDown(event) {
        if (disabled) {
          event.preventDefault();
          return;
        }
        externalOnPointerDown?.(event);
      }
    }, !isNativeButton ? {
      role: 'button'
    } : undefined, focusableWhenDisabledProps, otherExternalProps);
  }, [disabled, focusableWhenDisabledProps, isNativeButton, isValidLink]);
  return {
    getButtonProps,
    buttonRef
  };
}

/***/ }),

/***/ "./node_modules/@base-ui-components/react/esm/utils/clamp.js":
/*!*******************************************************************!*\
  !*** ./node_modules/@base-ui-components/react/esm/utils/clamp.js ***!
  \*******************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   clamp: () => (/* binding */ clamp)
/* harmony export */ });
function clamp(val, min = Number.MIN_SAFE_INTEGER, max = Number.MAX_SAFE_INTEGER) {
  return Math.max(min, Math.min(val, max));
}

/***/ }),

/***/ "./node_modules/@base-ui-components/react/esm/utils/collapsibleOpenStateMapping.js":
/*!*****************************************************************************************!*\
  !*** ./node_modules/@base-ui-components/react/esm/utils/collapsibleOpenStateMapping.js ***!
  \*****************************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   collapsibleOpenStateMapping: () => (/* binding */ collapsibleOpenStateMapping),
/* harmony export */   triggerOpenStateMapping: () => (/* binding */ triggerOpenStateMapping)
/* harmony export */ });
/* harmony import */ var _collapsible_panel_CollapsiblePanelDataAttributes_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../collapsible/panel/CollapsiblePanelDataAttributes.js */ "./node_modules/@base-ui-components/react/esm/collapsible/panel/CollapsiblePanelDataAttributes.js");
/* harmony import */ var _collapsible_trigger_CollapsibleTriggerDataAttributes_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../collapsible/trigger/CollapsibleTriggerDataAttributes.js */ "./node_modules/@base-ui-components/react/esm/collapsible/trigger/CollapsibleTriggerDataAttributes.js");


const PANEL_OPEN_HOOK = {
  [_collapsible_panel_CollapsiblePanelDataAttributes_js__WEBPACK_IMPORTED_MODULE_0__.CollapsiblePanelDataAttributes.open]: ''
};
const PANEL_CLOSED_HOOK = {
  [_collapsible_panel_CollapsiblePanelDataAttributes_js__WEBPACK_IMPORTED_MODULE_0__.CollapsiblePanelDataAttributes.closed]: ''
};
const triggerOpenStateMapping = {
  open(value) {
    if (value) {
      return {
        [_collapsible_trigger_CollapsibleTriggerDataAttributes_js__WEBPACK_IMPORTED_MODULE_1__.CollapsibleTriggerDataAttributes.panelOpen]: ''
      };
    }
    return null;
  }
};
const collapsibleOpenStateMapping = {
  open(value) {
    if (value) {
      return PANEL_OPEN_HOOK;
    }
    return PANEL_CLOSED_HOOK;
  }
};

/***/ }),

/***/ "./node_modules/@base-ui-components/react/esm/utils/constants.js":
/*!***********************************************************************!*\
  !*** ./node_modules/@base-ui-components/react/esm/utils/constants.js ***!
  \***********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   CLICK_TRIGGER_IDENTIFIER: () => (/* binding */ CLICK_TRIGGER_IDENTIFIER),
/* harmony export */   DISABLED_TRANSITIONS_STYLE: () => (/* binding */ DISABLED_TRANSITIONS_STYLE),
/* harmony export */   DROPDOWN_COLLISION_AVOIDANCE: () => (/* binding */ DROPDOWN_COLLISION_AVOIDANCE),
/* harmony export */   EMPTY_ARRAY: () => (/* binding */ EMPTY_ARRAY),
/* harmony export */   EMPTY_OBJECT: () => (/* binding */ EMPTY_OBJECT),
/* harmony export */   PATIENT_CLICK_THRESHOLD: () => (/* binding */ PATIENT_CLICK_THRESHOLD),
/* harmony export */   POPUP_COLLISION_AVOIDANCE: () => (/* binding */ POPUP_COLLISION_AVOIDANCE),
/* harmony export */   TYPEAHEAD_RESET_MS: () => (/* binding */ TYPEAHEAD_RESET_MS)
/* harmony export */ });
const TYPEAHEAD_RESET_MS = 500;
const PATIENT_CLICK_THRESHOLD = 500;
const DISABLED_TRANSITIONS_STYLE = {
  style: {
    transition: 'none'
  }
};
const EMPTY_OBJECT = {};
const EMPTY_ARRAY = [];
const CLICK_TRIGGER_IDENTIFIER = 'data-base-ui-click-trigger';

/**
 * Used for dropdowns that usually strictly prefer top/bottom placements and
 * use `var(--available-height)` to limit their height.
 */
const DROPDOWN_COLLISION_AVOIDANCE = {
  fallbackAxisSide: 'none'
};

/**
 * Used by regular popups that usually aren't scrollable and are allowed to
 * freely flip to any axis of placement.
 */
const POPUP_COLLISION_AVOIDANCE = {
  fallbackAxisSide: 'end'
};

/***/ }),

/***/ "./node_modules/@base-ui-components/react/esm/utils/formatNumber.js":
/*!**************************************************************************!*\
  !*** ./node_modules/@base-ui-components/react/esm/utils/formatNumber.js ***!
  \**************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   cache: () => (/* binding */ cache),
/* harmony export */   formatNumber: () => (/* binding */ formatNumber),
/* harmony export */   formatNumberMaxPrecision: () => (/* binding */ formatNumberMaxPrecision),
/* harmony export */   getFormatter: () => (/* binding */ getFormatter)
/* harmony export */ });
const cache = new Map();
function getFormatter(locale, options) {
  const optionsString = JSON.stringify({
    locale,
    options
  });
  const cachedFormatter = cache.get(optionsString);
  if (cachedFormatter) {
    return cachedFormatter;
  }
  const formatter = new Intl.NumberFormat(locale, options);
  cache.set(optionsString, formatter);
  return formatter;
}
function formatNumber(value, locale, options) {
  if (value == null) {
    return '';
  }
  return getFormatter(locale, options).format(value);
}
function formatNumberMaxPrecision(value, locale, options) {
  return formatNumber(value, locale, {
    ...options,
    maximumFractionDigits: 20
  });
}

/***/ }),

/***/ "./node_modules/@base-ui-components/react/esm/utils/getStyleHookProps.js":
/*!*******************************************************************************!*\
  !*** ./node_modules/@base-ui-components/react/esm/utils/getStyleHookProps.js ***!
  \*******************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   getStyleHookProps: () => (/* binding */ getStyleHookProps)
/* harmony export */ });
function getStyleHookProps(state, customMapping) {
  const props = {};

  /* eslint-disable-next-line guard-for-in */
  for (const key in state) {
    const value = state[key];
    if (customMapping?.hasOwnProperty(key)) {
      const customProps = customMapping[key](value);
      if (customProps != null) {
        Object.assign(props, customProps);
      }
      continue;
    }
    if (value === true) {
      props[`data-${key.toLowerCase()}`] = '';
    } else if (value) {
      props[`data-${key.toLowerCase()}`] = value.toString();
    }
  }
  return props;
}

/***/ }),

/***/ "./node_modules/@base-ui-components/react/esm/utils/noop.js":
/*!******************************************************************!*\
  !*** ./node_modules/@base-ui-components/react/esm/utils/noop.js ***!
  \******************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   NOOP: () => (/* binding */ NOOP)
/* harmony export */ });
const NOOP = () => {};

/***/ }),

/***/ "./node_modules/@base-ui-components/react/esm/utils/resolveClassName.js":
/*!******************************************************************************!*\
  !*** ./node_modules/@base-ui-components/react/esm/utils/resolveClassName.js ***!
  \******************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   resolveClassName: () => (/* binding */ resolveClassName)
/* harmony export */ });
/**
 * If the provided className is a string, it will be returned as is.
 * Otherwise, the function will call the className function with the state as the first argument.
 *
 * @param className
 * @param state
 */
function resolveClassName(className, state) {
  return typeof className === 'function' ? className(state) : className;
}

/***/ }),

/***/ "./node_modules/@base-ui-components/react/esm/utils/styleHookMapping.js":
/*!******************************************************************************!*\
  !*** ./node_modules/@base-ui-components/react/esm/utils/styleHookMapping.js ***!
  \******************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   TransitionStatusDataAttributes: () => (/* binding */ TransitionStatusDataAttributes),
/* harmony export */   transitionStatusMapping: () => (/* binding */ transitionStatusMapping)
/* harmony export */ });
let TransitionStatusDataAttributes = /*#__PURE__*/function (TransitionStatusDataAttributes) {
  /**
   * Present when the component is animating in.
   */
  TransitionStatusDataAttributes["startingStyle"] = "data-starting-style";
  /**
   * Present when the component is animating out.
   */
  TransitionStatusDataAttributes["endingStyle"] = "data-ending-style";
  return TransitionStatusDataAttributes;
}({});
const STARTING_HOOK = {
  [TransitionStatusDataAttributes.startingStyle]: ''
};
const ENDING_HOOK = {
  [TransitionStatusDataAttributes.endingStyle]: ''
};
const transitionStatusMapping = {
  transitionStatus(value) {
    if (value === 'starting') {
      return STARTING_HOOK;
    }
    if (value === 'ending') {
      return ENDING_HOOK;
    }
    return null;
  }
};

/***/ }),

/***/ "./node_modules/@base-ui-components/react/esm/utils/useAnimationsFinished.js":
/*!***********************************************************************************!*\
  !*** ./node_modules/@base-ui-components/react/esm/utils/useAnimationsFinished.js ***!
  \***********************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   useAnimationsFinished: () => (/* binding */ useAnimationsFinished)
/* harmony export */ });
/* harmony import */ var react_dom__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react-dom */ "react-dom");
/* harmony import */ var _base_ui_components_utils_useAnimationFrame__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @base-ui-components/utils/useAnimationFrame */ "./node_modules/@base-ui-components/utils/esm/useAnimationFrame.js");
/* harmony import */ var _base_ui_components_utils_useEventCallback__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @base-ui-components/utils/useEventCallback */ "./node_modules/@base-ui-components/utils/esm/useEventCallback.js");
'use client';





/**
 * Executes a function once all animations have finished on the provided element.
 * @param elementOrRef - The element to watch for animations.
 * @param waitForNextTick - Whether to wait for the next tick before checking for animations.
 */
function useAnimationsFinished(elementOrRef, waitForNextTick = false) {
  const frame = (0,_base_ui_components_utils_useAnimationFrame__WEBPACK_IMPORTED_MODULE_1__.useAnimationFrame)();
  return (0,_base_ui_components_utils_useEventCallback__WEBPACK_IMPORTED_MODULE_2__.useEventCallback)((fnToExecute,
  /**
   * An optional [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) that
   * can be used to abort `fnToExecute` before all the animations have finished.
   * @default null
   */
  signal = null) => {
    frame.cancel();
    if (elementOrRef == null) {
      return;
    }
    let element;
    if ('current' in elementOrRef) {
      if (elementOrRef.current == null) {
        return;
      }
      element = elementOrRef.current;
    } else {
      element = elementOrRef;
    }
    if (typeof element.getAnimations !== 'function' || globalThis.BASE_UI_ANIMATIONS_DISABLED) {
      fnToExecute();
    } else {
      frame.request(() => {
        function exec() {
          if (!element) {
            return;
          }
          Promise.allSettled(element.getAnimations().map(anim => anim.finished)).then(() => {
            if (signal != null && signal.aborted) {
              return;
            }
            // Synchronously flush the unmounting of the component so that the browser doesn't
            // paint: https://github.com/mui/base-ui/issues/979
            react_dom__WEBPACK_IMPORTED_MODULE_0__.flushSync(fnToExecute);
          });
        }

        // `open: true` animations need to wait for the next tick to be detected
        if (waitForNextTick) {
          frame.request(exec);
        } else {
          exec();
        }
      });
    }
  });
}

/***/ }),

/***/ "./node_modules/@base-ui-components/react/esm/utils/useBaseUiId.js":
/*!*************************************************************************!*\
  !*** ./node_modules/@base-ui-components/react/esm/utils/useBaseUiId.js ***!
  \*************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   useBaseUiId: () => (/* binding */ useBaseUiId)
/* harmony export */ });
/* harmony import */ var _base_ui_components_utils_useId__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @base-ui-components/utils/useId */ "./node_modules/@base-ui-components/utils/esm/useId.js");
'use client';



/**
 * Wraps `useId` and prefixes generated `id`s with `base-ui-`
 * @param {string | undefined} idOverride overrides the generated id when provided
 * @returns {string | undefined}
 */
function useBaseUiId(idOverride) {
  return (0,_base_ui_components_utils_useId__WEBPACK_IMPORTED_MODULE_0__.useId)(idOverride, 'base-ui');
}

/***/ }),

/***/ "./node_modules/@base-ui-components/react/esm/utils/useFocusableWhenDisabled.js":
/*!**************************************************************************************!*\
  !*** ./node_modules/@base-ui-components/react/esm/utils/useFocusableWhenDisabled.js ***!
  \**************************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   useFocusableWhenDisabled: () => (/* binding */ useFocusableWhenDisabled)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
'use client';


function useFocusableWhenDisabled(parameters) {
  const {
    focusableWhenDisabled,
    disabled,
    composite = false,
    tabIndex: tabIndexProp = 0,
    isNativeButton
  } = parameters;
  const isFocusableComposite = composite && focusableWhenDisabled !== false;
  const isNonFocusableComposite = composite && focusableWhenDisabled === false;

  // we can't explicitly assign `undefined` to any of these props because it
  // would otherwise prevent subsequently merged props from setting them
  const props = react__WEBPACK_IMPORTED_MODULE_0__.useMemo(() => {
    const additionalProps = {
      // allow Tabbing away from focusableWhenDisabled elements
      onKeyDown(event) {
        if (disabled && focusableWhenDisabled && event.key !== 'Tab') {
          event.preventDefault();
        }
      }
    };
    if (!composite) {
      additionalProps.tabIndex = tabIndexProp;
      if (!isNativeButton && disabled) {
        additionalProps.tabIndex = focusableWhenDisabled ? tabIndexProp : -1;
      }
    }
    if (isNativeButton && (focusableWhenDisabled || isFocusableComposite) || !isNativeButton && disabled) {
      additionalProps['aria-disabled'] = disabled;
    }
    if (isNativeButton && (!focusableWhenDisabled || isNonFocusableComposite)) {
      additionalProps.disabled = disabled;
    }
    return additionalProps;
  }, [composite, disabled, focusableWhenDisabled, isFocusableComposite, isNonFocusableComposite, isNativeButton, tabIndexProp]);
  return {
    props
  };
}

/***/ }),

/***/ "./node_modules/@base-ui-components/react/esm/utils/useOpenChangeComplete.js":
/*!***********************************************************************************!*\
  !*** ./node_modules/@base-ui-components/react/esm/utils/useOpenChangeComplete.js ***!
  \***********************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   useOpenChangeComplete: () => (/* binding */ useOpenChangeComplete)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var _base_ui_components_utils_useEventCallback__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @base-ui-components/utils/useEventCallback */ "./node_modules/@base-ui-components/utils/esm/useEventCallback.js");
/* harmony import */ var _base_ui_components_utils_useLatestRef__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @base-ui-components/utils/useLatestRef */ "./node_modules/@base-ui-components/utils/esm/useLatestRef.js");
/* harmony import */ var _useAnimationsFinished_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./useAnimationsFinished.js */ "./node_modules/@base-ui-components/react/esm/utils/useAnimationsFinished.js");
'use client';






/**
 * Calls the provided function when the CSS open/close animation or transition completes.
 */
function useOpenChangeComplete(parameters) {
  const {
    enabled = true,
    open,
    ref,
    onComplete: onCompleteParam
  } = parameters;
  const openRef = (0,_base_ui_components_utils_useLatestRef__WEBPACK_IMPORTED_MODULE_2__.useLatestRef)(open);
  const onComplete = (0,_base_ui_components_utils_useEventCallback__WEBPACK_IMPORTED_MODULE_1__.useEventCallback)(onCompleteParam);
  const runOnceAnimationsFinish = (0,_useAnimationsFinished_js__WEBPACK_IMPORTED_MODULE_3__.useAnimationsFinished)(ref, open);
  react__WEBPACK_IMPORTED_MODULE_0__.useEffect(() => {
    if (!enabled) {
      return;
    }
    runOnceAnimationsFinish(() => {
      if (open === openRef.current) {
        onComplete();
      }
    });
  }, [enabled, open, onComplete, runOnceAnimationsFinish, openRef]);
}

/***/ }),

/***/ "./node_modules/@base-ui-components/react/esm/utils/useRenderElement.js":
/*!******************************************************************************!*\
  !*** ./node_modules/@base-ui-components/react/esm/utils/useRenderElement.js ***!
  \******************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   useRenderElement: () => (/* binding */ useRenderElement)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var _base_ui_components_utils_useMergedRefs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @base-ui-components/utils/useMergedRefs */ "./node_modules/@base-ui-components/utils/esm/useMergedRefs.js");
/* harmony import */ var _base_ui_components_utils_reactVersion__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @base-ui-components/utils/reactVersion */ "./node_modules/@base-ui-components/utils/esm/reactVersion.js");
/* harmony import */ var _base_ui_components_utils_mergeObjects__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @base-ui-components/utils/mergeObjects */ "./node_modules/@base-ui-components/utils/esm/mergeObjects.js");
/* harmony import */ var _getStyleHookProps_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./getStyleHookProps.js */ "./node_modules/@base-ui-components/react/esm/utils/getStyleHookProps.js");
/* harmony import */ var _resolveClassName_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./resolveClassName.js */ "./node_modules/@base-ui-components/react/esm/utils/resolveClassName.js");
/* harmony import */ var _merge_props_index_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../merge-props/index.js */ "./node_modules/@base-ui-components/react/esm/merge-props/mergeProps.js");
/* harmony import */ var _constants_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./constants.js */ "./node_modules/@base-ui-components/react/esm/utils/constants.js");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");









/**
 * Renders a Base UI element.
 *
 * @param element The default HTML element to render. Can be overridden by the `render` prop.
 * @param componentProps An object containing the `render` and `className` props to be used for element customization. Other props are ignored.
 * @param params Additional parameters for rendering the element.
 */
function useRenderElement(element, componentProps, params = {}) {
  const renderProp = componentProps.render;
  const outProps = useRenderElementProps(componentProps, params);
  if (params.enabled === false) {
    return null;
  }
  const state = params.state ?? _constants_js__WEBPACK_IMPORTED_MODULE_7__.EMPTY_OBJECT;
  return evaluateRenderProp(element, renderProp, outProps, state);
}

/**
 * Computes render element final props.
 */
function useRenderElementProps(componentProps, params = {}) {
  const {
    className: classNameProp,
    render: renderProp
  } = componentProps;
  const {
    state = _constants_js__WEBPACK_IMPORTED_MODULE_7__.EMPTY_OBJECT,
    ref,
    props,
    disableStyleHooks,
    customStyleHookMapping,
    enabled = true
  } = params;
  const className = enabled ? (0,_resolveClassName_js__WEBPACK_IMPORTED_MODULE_5__.resolveClassName)(classNameProp, state) : undefined;
  let styleHooks;
  if (disableStyleHooks !== true) {
    // SAFETY: We use typings to ensure `disableStyleHooks` is either always set or
    // always unset, so this `if` block is stable across renders.
    /* eslint-disable-next-line react-hooks/rules-of-hooks */
    styleHooks = react__WEBPACK_IMPORTED_MODULE_0__.useMemo(() => enabled ? (0,_getStyleHookProps_js__WEBPACK_IMPORTED_MODULE_4__.getStyleHookProps)(state, customStyleHookMapping) : _constants_js__WEBPACK_IMPORTED_MODULE_7__.EMPTY_OBJECT, [state, customStyleHookMapping, enabled]);
  }
  const outProps = enabled ? (0,_base_ui_components_utils_mergeObjects__WEBPACK_IMPORTED_MODULE_3__.mergeObjects)(styleHooks, Array.isArray(props) ? (0,_merge_props_index_js__WEBPACK_IMPORTED_MODULE_6__.mergePropsN)(props) : props) ?? _constants_js__WEBPACK_IMPORTED_MODULE_7__.EMPTY_OBJECT : _constants_js__WEBPACK_IMPORTED_MODULE_7__.EMPTY_OBJECT;

  // SAFETY: The `useMergedRefs` functions use a single hook to store the same value,
  // switching between them at runtime is safe. If this assertion fails, React will
  // throw at runtime anyway.
  // This also skips the `useMergedRefs` call on the server, which is fine because
  // refs are not used on the server side.
  /* eslint-disable react-hooks/rules-of-hooks */
  if (typeof document !== 'undefined') {
    if (!enabled) {
      (0,_base_ui_components_utils_useMergedRefs__WEBPACK_IMPORTED_MODULE_1__.useMergedRefs)(null, null);
    } else if (Array.isArray(ref)) {
      outProps.ref = (0,_base_ui_components_utils_useMergedRefs__WEBPACK_IMPORTED_MODULE_1__.useMergedRefsN)([outProps.ref, getChildRef(renderProp), ...ref]);
    } else {
      outProps.ref = (0,_base_ui_components_utils_useMergedRefs__WEBPACK_IMPORTED_MODULE_1__.useMergedRefs)(outProps.ref, getChildRef(renderProp), ref);
    }
  }
  if (!enabled) {
    return _constants_js__WEBPACK_IMPORTED_MODULE_7__.EMPTY_OBJECT;
  }
  if (className !== undefined) {
    outProps.className = (0,_merge_props_index_js__WEBPACK_IMPORTED_MODULE_6__.mergeClassNames)(outProps.className, className);
  }
  return outProps;
}
function evaluateRenderProp(element, render, props, state) {
  if (render) {
    if (typeof render === 'function') {
      return render(props, state);
    }
    const mergedProps = (0,_merge_props_index_js__WEBPACK_IMPORTED_MODULE_6__.mergeProps)(props, render.props);
    mergedProps.ref = props.ref;
    return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.cloneElement(render, mergedProps);
  }
  if (element) {
    if (typeof element === 'string') {
      return renderTag(element, props);
    }
  }
  // Unreachable, but the typings on `useRenderElement` need to be reworked
  // to annotate it correctly.
  throw new Error('Base UI: Render element or function are not defined.');
}
function renderTag(Tag, props) {
  if (Tag === 'button') {
    return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)("button", {
      type: "button",
      ...props
    });
  }
  if (Tag === 'img') {
    return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)("img", {
      alt: "",
      ...props
    });
  }
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(Tag, props);
}
function getChildRef(render) {
  if (render && typeof render !== 'function') {
    return (0,_base_ui_components_utils_reactVersion__WEBPACK_IMPORTED_MODULE_2__.isReactVersionAtLeast)(19) ? render.props.ref : render.ref;
  }
  return null;
}

/***/ }),

/***/ "./node_modules/@base-ui-components/react/esm/utils/useTransitionStatus.js":
/*!*********************************************************************************!*\
  !*** ./node_modules/@base-ui-components/react/esm/utils/useTransitionStatus.js ***!
  \*********************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   useTransitionStatus: () => (/* binding */ useTransitionStatus)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react_dom__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react-dom */ "react-dom");
/* harmony import */ var _base_ui_components_utils_useIsoLayoutEffect__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @base-ui-components/utils/useIsoLayoutEffect */ "./node_modules/@base-ui-components/utils/esm/useIsoLayoutEffect.js");
/* harmony import */ var _base_ui_components_utils_useAnimationFrame__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @base-ui-components/utils/useAnimationFrame */ "./node_modules/@base-ui-components/utils/esm/useAnimationFrame.js");
'use client';





/**
 * Provides a status string for CSS animations.
 * @param open - a boolean that determines if the element is open.
 * @param enableIdleState - a boolean that enables the `'idle'` state between `'starting'` and `'ending'`
 */
function useTransitionStatus(open, enableIdleState = false, deferEndingState = false) {
  const [transitionStatus, setTransitionStatus] = react__WEBPACK_IMPORTED_MODULE_0__.useState(open && enableIdleState ? 'idle' : undefined);
  const [mounted, setMounted] = react__WEBPACK_IMPORTED_MODULE_0__.useState(open);
  if (open && !mounted) {
    setMounted(true);
    setTransitionStatus('starting');
  }
  if (!open && mounted && transitionStatus !== 'ending' && !deferEndingState) {
    setTransitionStatus('ending');
  }
  if (!open && !mounted && transitionStatus === 'ending') {
    setTransitionStatus(undefined);
  }
  (0,_base_ui_components_utils_useIsoLayoutEffect__WEBPACK_IMPORTED_MODULE_2__.useIsoLayoutEffect)(() => {
    if (!open && mounted && transitionStatus !== 'ending' && deferEndingState) {
      const frame = _base_ui_components_utils_useAnimationFrame__WEBPACK_IMPORTED_MODULE_3__.AnimationFrame.request(() => {
        setTransitionStatus('ending');
      });
      return () => {
        _base_ui_components_utils_useAnimationFrame__WEBPACK_IMPORTED_MODULE_3__.AnimationFrame.cancel(frame);
      };
    }
    return undefined;
  }, [open, mounted, transitionStatus, deferEndingState]);
  (0,_base_ui_components_utils_useIsoLayoutEffect__WEBPACK_IMPORTED_MODULE_2__.useIsoLayoutEffect)(() => {
    if (!open || enableIdleState) {
      return undefined;
    }
    const frame = _base_ui_components_utils_useAnimationFrame__WEBPACK_IMPORTED_MODULE_3__.AnimationFrame.request(() => {
      react_dom__WEBPACK_IMPORTED_MODULE_1__.flushSync(() => {
        setTransitionStatus(undefined);
      });
    });
    return () => {
      _base_ui_components_utils_useAnimationFrame__WEBPACK_IMPORTED_MODULE_3__.AnimationFrame.cancel(frame);
    };
  }, [enableIdleState, open]);
  (0,_base_ui_components_utils_useIsoLayoutEffect__WEBPACK_IMPORTED_MODULE_2__.useIsoLayoutEffect)(() => {
    if (!open || !enableIdleState) {
      return undefined;
    }
    if (open && mounted && transitionStatus !== 'idle') {
      setTransitionStatus('starting');
    }
    const frame = _base_ui_components_utils_useAnimationFrame__WEBPACK_IMPORTED_MODULE_3__.AnimationFrame.request(() => {
      setTransitionStatus('idle');
    });
    return () => {
      _base_ui_components_utils_useAnimationFrame__WEBPACK_IMPORTED_MODULE_3__.AnimationFrame.cancel(frame);
    };
  }, [enableIdleState, open, mounted, setTransitionStatus, transitionStatus]);
  return react__WEBPACK_IMPORTED_MODULE_0__.useMemo(() => ({
    mounted,
    setMounted,
    transitionStatus
  }), [mounted, transitionStatus]);
}

/***/ }),

/***/ "./node_modules/@base-ui-components/utils/esm/detectBrowser.js":
/*!*********************************************************************!*\
  !*** ./node_modules/@base-ui-components/utils/esm/detectBrowser.js ***!
  \*********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   isAndroid: () => (/* binding */ isAndroid),
/* harmony export */   isFirefox: () => (/* binding */ isFirefox),
/* harmony export */   isIOS: () => (/* binding */ isIOS),
/* harmony export */   isJSDOM: () => (/* binding */ isJSDOM),
/* harmony export */   isMac: () => (/* binding */ isMac),
/* harmony export */   isSafari: () => (/* binding */ isSafari),
/* harmony export */   isWebKit: () => (/* binding */ isWebKit)
/* harmony export */ });
const hasNavigator = typeof navigator !== 'undefined';
const nav = getNavigatorData();
const platform = getPlatform();
const userAgent = getUserAgent();
const isWebKit = typeof CSS === 'undefined' || !CSS.supports ? false : CSS.supports('-webkit-backdrop-filter:none');
const isIOS =
// iPads can claim to be MacIntel
nav.platform === 'MacIntel' && nav.maxTouchPoints > 1 ? true : /iP(hone|ad|od)|iOS/.test(nav.platform);
const isFirefox = hasNavigator && /firefox/i.test(userAgent);
const isSafari = hasNavigator && /apple/i.test(navigator.vendor);
const isAndroid = hasNavigator && /android/i.test(platform) || /android/i.test(userAgent);
const isMac = hasNavigator && platform.toLowerCase().startsWith('mac') && !navigator.maxTouchPoints;
const isJSDOM = userAgent.includes('jsdom/');

// Avoid Chrome DevTools blue warning.
function getNavigatorData() {
  if (!hasNavigator) {
    return {
      platform: '',
      maxTouchPoints: -1
    };
  }
  const uaData = navigator.userAgentData;
  if (uaData?.platform) {
    return {
      platform: uaData.platform,
      maxTouchPoints: navigator.maxTouchPoints
    };
  }
  return {
    platform: navigator.platform ?? '',
    maxTouchPoints: navigator.maxTouchPoints ?? -1
  };
}
function getUserAgent() {
  if (!hasNavigator) {
    return '';
  }
  const uaData = navigator.userAgentData;
  if (uaData && Array.isArray(uaData.brands)) {
    return uaData.brands.map(({
      brand,
      version
    }) => `${brand}/${version}`).join(' ');
  }
  return navigator.userAgent;
}
function getPlatform() {
  if (!hasNavigator) {
    return '';
  }
  const uaData = navigator.userAgentData;
  if (uaData?.platform) {
    return uaData.platform;
  }
  return navigator.platform ?? '';
}

/***/ }),

/***/ "./node_modules/@base-ui-components/utils/esm/error.js":
/*!*************************************************************!*\
  !*** ./node_modules/@base-ui-components/utils/esm/error.js ***!
  \*************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   error: () => (/* binding */ error)
/* harmony export */ });
let set;
if (true) {
  set = new Set();
}
function error(...messages) {
  if (true) {
    const messageKey = messages.join(' ');
    if (!set.has(messageKey)) {
      set.add(messageKey);
      console.error(`Base UI: ${messageKey}`);
    }
  }
}

/***/ }),

/***/ "./node_modules/@base-ui-components/utils/esm/isElementDisabled.js":
/*!*************************************************************************!*\
  !*** ./node_modules/@base-ui-components/utils/esm/isElementDisabled.js ***!
  \*************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   isElementDisabled: () => (/* binding */ isElementDisabled)
/* harmony export */ });
function isElementDisabled(element) {
  return element == null || element.hasAttribute('disabled') || element.getAttribute('aria-disabled') === 'true';
}

/***/ }),

/***/ "./node_modules/@base-ui-components/utils/esm/mergeObjects.js":
/*!********************************************************************!*\
  !*** ./node_modules/@base-ui-components/utils/esm/mergeObjects.js ***!
  \********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   mergeObjects: () => (/* binding */ mergeObjects)
/* harmony export */ });
function mergeObjects(a, b) {
  if (a && !b) {
    return a;
  }
  if (!a && b) {
    return b;
  }
  if (a || b) {
    return {
      ...a,
      ...b
    };
  }
  return undefined;
}

/***/ }),

/***/ "./node_modules/@base-ui-components/utils/esm/owner.js":
/*!*************************************************************!*\
  !*** ./node_modules/@base-ui-components/utils/esm/owner.js ***!
  \*************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ownerDocument: () => (/* binding */ ownerDocument),
/* harmony export */   ownerWindow: () => (/* reexport safe */ _floating_ui_utils_dom__WEBPACK_IMPORTED_MODULE_0__.getWindow)
/* harmony export */ });
/* harmony import */ var _floating_ui_utils_dom__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @floating-ui/utils/dom */ "./node_modules/@floating-ui/utils/dist/floating-ui.utils.dom.mjs");

function ownerDocument(node) {
  return node?.ownerDocument || document;
}

/***/ }),

/***/ "./node_modules/@base-ui-components/utils/esm/reactVersion.js":
/*!********************************************************************!*\
  !*** ./node_modules/@base-ui-components/utils/esm/reactVersion.js ***!
  \********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   isReactVersionAtLeast: () => (/* binding */ isReactVersionAtLeast)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");

const majorVersion = parseInt(react__WEBPACK_IMPORTED_MODULE_0__.version, 10);
function isReactVersionAtLeast(reactVersionToCheck) {
  return majorVersion >= reactVersionToCheck;
}

/***/ }),

/***/ "./node_modules/@base-ui-components/utils/esm/safeReact.js":
/*!*****************************************************************!*\
  !*** ./node_modules/@base-ui-components/utils/esm/safeReact.js ***!
  \*****************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

var react__WEBPACK_IMPORTED_MODULE_0___namespace_cache;
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   SafeReact: () => (/* binding */ SafeReact)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");


// https://github.com/mui/material-ui/issues/41190#issuecomment-2040873379
const SafeReact = {
  .../*#__PURE__*/ (react__WEBPACK_IMPORTED_MODULE_0___namespace_cache || (react__WEBPACK_IMPORTED_MODULE_0___namespace_cache = __webpack_require__.t(react__WEBPACK_IMPORTED_MODULE_0__, 2)))
};

/***/ }),

/***/ "./node_modules/@base-ui-components/utils/esm/useAnimationFrame.js":
/*!*************************************************************************!*\
  !*** ./node_modules/@base-ui-components/utils/esm/useAnimationFrame.js ***!
  \*************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AnimationFrame: () => (/* binding */ AnimationFrame),
/* harmony export */   useAnimationFrame: () => (/* binding */ useAnimationFrame)
/* harmony export */ });
/* harmony import */ var _useRefWithInit_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./useRefWithInit.js */ "./node_modules/@base-ui-components/utils/esm/useRefWithInit.js");
/* harmony import */ var _useOnMount_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./useOnMount.js */ "./node_modules/@base-ui-components/utils/esm/useOnMount.js");
'use client';



/** Unlike `setTimeout`, rAF doesn't guarantee a positive integer return value, so we can't have
 * a monomorphic `uint` type with `0` meaning empty.
 * See warning note at:
 * https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame#return_value */
const EMPTY = null;
let LAST_RAF = globalThis.requestAnimationFrame;
class Scheduler {
  /* This implementation uses an array as a backing data-structure for frame callbacks.
   * It allows `O(1)` callback cancelling by inserting a `null` in the array, though it
   * never calls the native `cancelAnimationFrame` if there are no frames left. This can
   * be much more efficient if there is a call pattern that alterns as
   * "request-cancel-request-cancel-…".
   * But in the case of "request-request-…-cancel-cancel-…", it leaves the final animation
   * frame to run anyway. We turn that frame into a `O(1)` no-op via `callbacksCount`. */

  callbacks = (() => [])();
  callbacksCount = 0;
  nextId = 1;
  startId = 1;
  isScheduled = false;
  tick = timestamp => {
    this.isScheduled = false;
    const currentCallbacks = this.callbacks;
    const currentCallbacksCount = this.callbacksCount;

    // Update these before iterating, callbacks could call `requestAnimationFrame` again.
    this.callbacks = [];
    this.callbacksCount = 0;
    this.startId = this.nextId;
    if (currentCallbacksCount > 0) {
      for (let i = 0; i < currentCallbacks.length; i += 1) {
        currentCallbacks[i]?.(timestamp);
      }
    }
  };
  request(fn) {
    const id = this.nextId;
    this.nextId += 1;
    this.callbacks.push(fn);
    this.callbacksCount += 1;

    /* In a test environment with fake timers, a fake `requestAnimationFrame` can be called
     * but there's no guarantee that the animation frame will actually run before the fake
     * timers are teared, which leaves `isScheduled` set, but won't run our `tick()`. */
    const didRAFChange =  false && (0);
    if (!this.isScheduled || didRAFChange) {
      requestAnimationFrame(this.tick);
      this.isScheduled = true;
    }
    return id;
  }
  cancel(id) {
    const index = id - this.startId;
    if (index < 0 || index >= this.callbacks.length) {
      return;
    }
    this.callbacks[index] = null;
    this.callbacksCount -= 1;
  }
}
const scheduler = new Scheduler();
class AnimationFrame {
  static create() {
    return new AnimationFrame();
  }
  static request(fn) {
    return scheduler.request(fn);
  }
  static cancel(id) {
    return scheduler.cancel(id);
  }
  currentId = (() => EMPTY)();

  /**
   * Executes `fn` after `delay`, clearing any previously scheduled call.
   */
  request(fn) {
    this.cancel();
    this.currentId = scheduler.request(() => {
      this.currentId = EMPTY;
      fn();
    });
  }
  cancel = () => {
    if (this.currentId !== EMPTY) {
      scheduler.cancel(this.currentId);
      this.currentId = EMPTY;
    }
  };
  disposeEffect = () => {
    return this.cancel;
  };
}

/**
 * A `requestAnimationFrame` with automatic cleanup and guard.
 */
function useAnimationFrame() {
  const timeout = (0,_useRefWithInit_js__WEBPACK_IMPORTED_MODULE_0__.useRefWithInit)(AnimationFrame.create).current;
  (0,_useOnMount_js__WEBPACK_IMPORTED_MODULE_1__.useOnMount)(timeout.disposeEffect);
  return timeout;
}

/***/ }),

/***/ "./node_modules/@base-ui-components/utils/esm/useControlled.js":
/*!*********************************************************************!*\
  !*** ./node_modules/@base-ui-components/utils/esm/useControlled.js ***!
  \*********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   useControlled: () => (/* binding */ useControlled)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
'use client';

// TODO: uncomment once we enable eslint-plugin-react-compiler // eslint-disable-next-line react-compiler/react-compiler -- process.env never changes, dependency arrays are intentionally ignored
/* eslint-disable react-hooks/rules-of-hooks, react-hooks/exhaustive-deps */

function useControlled({
  controlled,
  default: defaultProp,
  name,
  state = 'value'
}) {
  // isControlled is ignored in the hook dependency lists as it should never change.
  const {
    current: isControlled
  } = react__WEBPACK_IMPORTED_MODULE_0__.useRef(controlled !== undefined);
  const [valueState, setValue] = react__WEBPACK_IMPORTED_MODULE_0__.useState(defaultProp);
  const value = isControlled ? controlled : valueState;
  if (true) {
    react__WEBPACK_IMPORTED_MODULE_0__.useEffect(() => {
      if (isControlled !== (controlled !== undefined)) {
        console.error([`Base UI: A component is changing the ${isControlled ? '' : 'un'}controlled ${state} state of ${name} to be ${isControlled ? 'un' : ''}controlled.`, 'Elements should not switch from uncontrolled to controlled (or vice versa).', `Decide between using a controlled or uncontrolled ${name} ` + 'element for the lifetime of the component.', "The nature of the state is determined during the first render. It's considered controlled if the value is not `undefined`.", 'More info: https://fb.me/react-controlled-components'].join('\n'));
      }
    }, [state, name, controlled]);
    const {
      current: defaultValue
    } = react__WEBPACK_IMPORTED_MODULE_0__.useRef(defaultProp);
    react__WEBPACK_IMPORTED_MODULE_0__.useEffect(() => {
      // Object.is() is not equivalent to the === operator.
      // See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is for more details.
      if (!isControlled && !Object.is(defaultValue, defaultProp)) {
        console.error([`Base UI: A component is changing the default ${state} state of an uncontrolled ${name} after being initialized. ` + `To suppress this warning opt to use a controlled ${name}.`].join('\n'));
      }
    }, [JSON.stringify(defaultProp)]);
  }
  const setValueIfUncontrolled = react__WEBPACK_IMPORTED_MODULE_0__.useCallback(newValue => {
    if (!isControlled) {
      setValue(newValue);
    }
  }, []);
  return [value, setValueIfUncontrolled];
}

/***/ }),

/***/ "./node_modules/@base-ui-components/utils/esm/useEventCallback.js":
/*!************************************************************************!*\
  !*** ./node_modules/@base-ui-components/utils/esm/useEventCallback.js ***!
  \************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

var react__WEBPACK_IMPORTED_MODULE_0___namespace_cache;
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   useEventCallback: () => (/* binding */ useEventCallback)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var _useRefWithInit_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./useRefWithInit.js */ "./node_modules/@base-ui-components/utils/esm/useRefWithInit.js");
'use client';




// https://github.com/mui/material-ui/issues/41190#issuecomment-2040873379
const useInsertionEffect = /*#__PURE__*/ (react__WEBPACK_IMPORTED_MODULE_0___namespace_cache || (react__WEBPACK_IMPORTED_MODULE_0___namespace_cache = __webpack_require__.t(react__WEBPACK_IMPORTED_MODULE_0__, 2)))[`useInsertionEffect${Math.random().toFixed(1)}`.slice(0, -3)];
const useSafeInsertionEffect =
// React 17 doesn't have useInsertionEffect.
useInsertionEffect &&
// Preact replaces useInsertionEffect with useLayoutEffect and fires too late.
useInsertionEffect !== react__WEBPACK_IMPORTED_MODULE_0__.useLayoutEffect ? useInsertionEffect : fn => fn();
function useEventCallback(callback) {
  const stable = (0,_useRefWithInit_js__WEBPACK_IMPORTED_MODULE_1__.useRefWithInit)(createStableCallback).current;
  stable.next = callback;
  useSafeInsertionEffect(stable.effect);
  return stable.trampoline;
}
function createStableCallback() {
  const stable = {
    next: undefined,
    callback: assertNotCalled,
    trampoline: (...args) => stable.callback?.(...args),
    effect: () => {
      stable.callback = stable.next;
    }
  };
  return stable;
}
function assertNotCalled() {
  if (true) {
    throw new Error('Base UI: Cannot call an event handler while rendering.');
  }
}

/***/ }),

/***/ "./node_modules/@base-ui-components/utils/esm/useForcedRerendering.js":
/*!****************************************************************************!*\
  !*** ./node_modules/@base-ui-components/utils/esm/useForcedRerendering.js ***!
  \****************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   useForcedRerendering: () => (/* binding */ useForcedRerendering)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
'use client';



/**
 * Returns a function that forces a rerender.
 */
function useForcedRerendering() {
  const [, setState] = react__WEBPACK_IMPORTED_MODULE_0__.useState({});
  return react__WEBPACK_IMPORTED_MODULE_0__.useCallback(() => {
    setState({});
  }, []);
}

/***/ }),

/***/ "./node_modules/@base-ui-components/utils/esm/useId.js":
/*!*************************************************************!*\
  !*** ./node_modules/@base-ui-components/utils/esm/useId.js ***!
  \*************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   useId: () => (/* binding */ useId)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var _safeReact_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./safeReact.js */ "./node_modules/@base-ui-components/utils/esm/safeReact.js");
'use client';



let globalId = 0;

// TODO React 17: Remove `useGlobalId` once React 17 support is removed
function useGlobalId(idOverride, prefix = 'mui') {
  const [defaultId, setDefaultId] = react__WEBPACK_IMPORTED_MODULE_0__.useState(idOverride);
  const id = idOverride || defaultId;
  react__WEBPACK_IMPORTED_MODULE_0__.useEffect(() => {
    if (defaultId == null) {
      // Fallback to this default id when possible.
      // Use the incrementing value for client-side rendering only.
      // We can't use it server-side.
      // If you want to use random values please consider the Birthday Problem: https://en.wikipedia.org/wiki/Birthday_problem
      globalId += 1;
      setDefaultId(`${prefix}-${globalId}`);
    }
  }, [defaultId, prefix]);
  return id;
}
const maybeReactUseId = _safeReact_js__WEBPACK_IMPORTED_MODULE_1__.SafeReact.useId;

/**
 *
 * @example <div id={useId()} />
 * @param idOverride
 * @returns {string}
 */
function useId(idOverride, prefix) {
  // React.useId() is only available from React 17.0.0.
  if (maybeReactUseId !== undefined) {
    const reactId = maybeReactUseId();
    return idOverride ?? (prefix ? `${prefix}-${reactId}` : reactId);
  }

  // TODO: uncomment once we enable eslint-plugin-react-compiler // eslint-disable-next-line react-compiler/react-compiler
  // eslint-disable-next-line react-hooks/rules-of-hooks -- `React.useId` is invariant at runtime.
  return useGlobalId(idOverride, prefix);
}

/***/ }),

/***/ "./node_modules/@base-ui-components/utils/esm/useInterval.js":
/*!*******************************************************************!*\
  !*** ./node_modules/@base-ui-components/utils/esm/useInterval.js ***!
  \*******************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Interval: () => (/* binding */ Interval),
/* harmony export */   useInterval: () => (/* binding */ useInterval)
/* harmony export */ });
/* harmony import */ var _useRefWithInit_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./useRefWithInit.js */ "./node_modules/@base-ui-components/utils/esm/useRefWithInit.js");
/* harmony import */ var _useOnMount_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./useOnMount.js */ "./node_modules/@base-ui-components/utils/esm/useOnMount.js");
/* harmony import */ var _useTimeout_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./useTimeout.js */ "./node_modules/@base-ui-components/utils/esm/useTimeout.js");
'use client';




const EMPTY = 0;
class Interval extends _useTimeout_js__WEBPACK_IMPORTED_MODULE_2__.Timeout {
  static create() {
    return new Interval();
  }

  /**
   * Executes `fn` at `delay` interval, clearing any previously scheduled call.
   */
  start(delay, fn) {
    this.clear();
    this.currentId = setInterval(() => {
      fn();
    }, delay);
  }
  clear = () => {
    if (this.currentId !== EMPTY) {
      clearInterval(this.currentId);
      this.currentId = EMPTY;
    }
  };
}

/**
 * A `setInterval` with automatic cleanup and guard.
 */
function useInterval() {
  const timeout = (0,_useRefWithInit_js__WEBPACK_IMPORTED_MODULE_0__.useRefWithInit)(Interval.create).current;
  (0,_useOnMount_js__WEBPACK_IMPORTED_MODULE_1__.useOnMount)(timeout.disposeEffect);
  return timeout;
}

/***/ }),

/***/ "./node_modules/@base-ui-components/utils/esm/useIsoLayoutEffect.js":
/*!**************************************************************************!*\
  !*** ./node_modules/@base-ui-components/utils/esm/useIsoLayoutEffect.js ***!
  \**************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   useIsoLayoutEffect: () => (/* binding */ useIsoLayoutEffect)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
'use client';


const noop = () => {};
const useIsoLayoutEffect = typeof document !== 'undefined' ? react__WEBPACK_IMPORTED_MODULE_0__.useLayoutEffect : noop;

/***/ }),

/***/ "./node_modules/@base-ui-components/utils/esm/useLatestRef.js":
/*!********************************************************************!*\
  !*** ./node_modules/@base-ui-components/utils/esm/useLatestRef.js ***!
  \********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   useLatestRef: () => (/* binding */ useLatestRef)
/* harmony export */ });
/* harmony import */ var _useIsoLayoutEffect_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./useIsoLayoutEffect.js */ "./node_modules/@base-ui-components/utils/esm/useIsoLayoutEffect.js");
/* harmony import */ var _useRefWithInit_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./useRefWithInit.js */ "./node_modules/@base-ui-components/utils/esm/useRefWithInit.js");
'use client';



function useLatestRef(value) {
  const latest = (0,_useRefWithInit_js__WEBPACK_IMPORTED_MODULE_1__.useRefWithInit)(createLatestRef, value).current;
  latest.next = value;

  // eslint-disable-next-line react-hooks/exhaustive-deps
  (0,_useIsoLayoutEffect_js__WEBPACK_IMPORTED_MODULE_0__.useIsoLayoutEffect)(latest.effect);
  return latest;
}
function createLatestRef(value) {
  const latest = {
    current: value,
    next: value,
    effect: () => {
      latest.current = latest.next;
    }
  };
  return latest;
}

/***/ }),

/***/ "./node_modules/@base-ui-components/utils/esm/useMergedRefs.js":
/*!*********************************************************************!*\
  !*** ./node_modules/@base-ui-components/utils/esm/useMergedRefs.js ***!
  \*********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   useMergedRefs: () => (/* binding */ useMergedRefs),
/* harmony export */   useMergedRefsN: () => (/* binding */ useMergedRefsN)
/* harmony export */ });
/* harmony import */ var _useRefWithInit_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./useRefWithInit.js */ "./node_modules/@base-ui-components/utils/esm/useRefWithInit.js");


/**
 * Merges refs into a single memoized callback ref or `null`.
 * This makes sure multiple refs are updated together and have the same value.
 *
 * This function accepts up to four refs. If you need to merge more, or have an unspecified number of refs to merge,
 * use `useMergedRefsN` instead.
 */

function useMergedRefs(a, b, c, d) {
  const forkRef = (0,_useRefWithInit_js__WEBPACK_IMPORTED_MODULE_0__.useRefWithInit)(createForkRef).current;
  if (didChange(forkRef, a, b, c, d)) {
    update(forkRef, [a, b, c, d]);
  }
  return forkRef.callback;
}

/**
 * Merges an array of refs into a single memoized callback ref or `null`.
 *
 * If you need to merge a fixed number (up to four) of refs, use `useMergedRefs` instead for better performance.
 */
function useMergedRefsN(refs) {
  const forkRef = (0,_useRefWithInit_js__WEBPACK_IMPORTED_MODULE_0__.useRefWithInit)(createForkRef).current;
  if (didChangeN(forkRef, refs)) {
    update(forkRef, refs);
  }
  return forkRef.callback;
}
function createForkRef() {
  return {
    callback: null,
    cleanup: null,
    refs: []
  };
}
function didChange(forkRef, a, b, c, d) {
  // prettier-ignore
  return forkRef.refs[0] !== a || forkRef.refs[1] !== b || forkRef.refs[2] !== c || forkRef.refs[3] !== d;
}
function didChangeN(forkRef, newRefs) {
  return forkRef.refs.length !== newRefs.length || forkRef.refs.some((ref, index) => ref !== newRefs[index]);
}
function update(forkRef, refs) {
  forkRef.refs = refs;
  if (refs.every(ref => ref == null)) {
    forkRef.callback = null;
    return;
  }
  forkRef.callback = instance => {
    if (forkRef.cleanup) {
      forkRef.cleanup();
      forkRef.cleanup = null;
    }
    if (instance != null) {
      const cleanupCallbacks = Array(refs.length).fill(null);
      for (let i = 0; i < refs.length; i += 1) {
        const ref = refs[i];
        if (ref == null) {
          continue;
        }
        switch (typeof ref) {
          case 'function':
            {
              const refCleanup = ref(instance);
              if (typeof refCleanup === 'function') {
                cleanupCallbacks[i] = refCleanup;
              }
              break;
            }
          case 'object':
            {
              ref.current = instance;
              break;
            }
          default:
        }
      }
      forkRef.cleanup = () => {
        for (let i = 0; i < refs.length; i += 1) {
          const ref = refs[i];
          if (ref == null) {
            continue;
          }
          switch (typeof ref) {
            case 'function':
              {
                const cleanupCallback = cleanupCallbacks[i];
                if (typeof cleanupCallback === 'function') {
                  cleanupCallback();
                } else {
                  ref(null);
                }
                break;
              }
            case 'object':
              {
                ref.current = null;
                break;
              }
            default:
          }
        }
      };
    }
  };
}

/***/ }),

/***/ "./node_modules/@base-ui-components/utils/esm/useOnMount.js":
/*!******************************************************************!*\
  !*** ./node_modules/@base-ui-components/utils/esm/useOnMount.js ***!
  \******************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   useOnMount: () => (/* binding */ useOnMount)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
'use client';


const EMPTY = [];

/**
 * A React.useEffect equivalent that runs once, when the component is mounted.
 */
function useOnMount(fn) {
  // TODO: uncomment once we enable eslint-plugin-react-compiler // eslint-disable-next-line react-compiler/react-compiler -- no need to put `fn` in the dependency array
  /* eslint-disable react-hooks/exhaustive-deps */
  react__WEBPACK_IMPORTED_MODULE_0__.useEffect(fn, EMPTY);
  /* eslint-enable react-hooks/exhaustive-deps */
}

/***/ }),

/***/ "./node_modules/@base-ui-components/utils/esm/useRefWithInit.js":
/*!**********************************************************************!*\
  !*** ./node_modules/@base-ui-components/utils/esm/useRefWithInit.js ***!
  \**********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   useRefWithInit: () => (/* binding */ useRefWithInit)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
'use client';


const UNINITIALIZED = {};

/**
 * A React.useRef() that is initialized with a function. Note that it accepts an optional
 * initialization argument, so the initialization function doesn't need to be an inline closure.
 *
 * @usage
 *   const ref = useRefWithInit(sortColumns, columns)
 */

function useRefWithInit(init, initArg) {
  const ref = react__WEBPACK_IMPORTED_MODULE_0__.useRef(UNINITIALIZED);
  if (ref.current === UNINITIALIZED) {
    ref.current = init(initArg);
  }
  return ref;
}

/***/ }),

/***/ "./node_modules/@base-ui-components/utils/esm/useTimeout.js":
/*!******************************************************************!*\
  !*** ./node_modules/@base-ui-components/utils/esm/useTimeout.js ***!
  \******************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Timeout: () => (/* binding */ Timeout),
/* harmony export */   useTimeout: () => (/* binding */ useTimeout)
/* harmony export */ });
/* harmony import */ var _useRefWithInit_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./useRefWithInit.js */ "./node_modules/@base-ui-components/utils/esm/useRefWithInit.js");
/* harmony import */ var _useOnMount_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./useOnMount.js */ "./node_modules/@base-ui-components/utils/esm/useOnMount.js");
'use client';



const EMPTY = 0;
class Timeout {
  static create() {
    return new Timeout();
  }
  currentId = (() => EMPTY)();

  /**
   * Executes `fn` after `delay`, clearing any previously scheduled call.
   */
  start(delay, fn) {
    this.clear();
    this.currentId = setTimeout(() => {
      this.currentId = EMPTY;
      fn();
    }, delay); /* Node.js types are enabled in development */
  }
  isStarted() {
    return this.currentId !== EMPTY;
  }
  clear = () => {
    if (this.currentId !== EMPTY) {
      clearTimeout(this.currentId);
      this.currentId = EMPTY;
    }
  };
  disposeEffect = () => {
    return this.clear;
  };
}

/**
 * A `setTimeout` with automatic cleanup and guard.
 */
function useTimeout() {
  const timeout = (0,_useRefWithInit_js__WEBPACK_IMPORTED_MODULE_0__.useRefWithInit)(Timeout.create).current;
  (0,_useOnMount_js__WEBPACK_IMPORTED_MODULE_1__.useOnMount)(timeout.disposeEffect);
  return timeout;
}

/***/ }),

/***/ "./node_modules/@base-ui-components/utils/esm/warn.js":
/*!************************************************************!*\
  !*** ./node_modules/@base-ui-components/utils/esm/warn.js ***!
  \************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   warn: () => (/* binding */ warn)
/* harmony export */ });
let set;
if (true) {
  set = new Set();
}
function warn(...messages) {
  if (true) {
    const messageKey = messages.join(' ');
    if (!set.has(messageKey)) {
      set.add(messageKey);
      console.warn(`Base UI: ${messageKey}`);
    }
  }
}

/***/ }),

/***/ "./node_modules/@floating-ui/utils/dist/floating-ui.utils.dom.mjs":
/*!************************************************************************!*\
  !*** ./node_modules/@floating-ui/utils/dist/floating-ui.utils.dom.mjs ***!
  \************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   getComputedStyle: () => (/* binding */ getComputedStyle),
/* harmony export */   getContainingBlock: () => (/* binding */ getContainingBlock),
/* harmony export */   getDocumentElement: () => (/* binding */ getDocumentElement),
/* harmony export */   getFrameElement: () => (/* binding */ getFrameElement),
/* harmony export */   getNearestOverflowAncestor: () => (/* binding */ getNearestOverflowAncestor),
/* harmony export */   getNodeName: () => (/* binding */ getNodeName),
/* harmony export */   getNodeScroll: () => (/* binding */ getNodeScroll),
/* harmony export */   getOverflowAncestors: () => (/* binding */ getOverflowAncestors),
/* harmony export */   getParentNode: () => (/* binding */ getParentNode),
/* harmony export */   getWindow: () => (/* binding */ getWindow),
/* harmony export */   isContainingBlock: () => (/* binding */ isContainingBlock),
/* harmony export */   isElement: () => (/* binding */ isElement),
/* harmony export */   isHTMLElement: () => (/* binding */ isHTMLElement),
/* harmony export */   isLastTraversableNode: () => (/* binding */ isLastTraversableNode),
/* harmony export */   isNode: () => (/* binding */ isNode),
/* harmony export */   isOverflowElement: () => (/* binding */ isOverflowElement),
/* harmony export */   isShadowRoot: () => (/* binding */ isShadowRoot),
/* harmony export */   isTableElement: () => (/* binding */ isTableElement),
/* harmony export */   isTopLayer: () => (/* binding */ isTopLayer),
/* harmony export */   isWebKit: () => (/* binding */ isWebKit)
/* harmony export */ });
function hasWindow() {
  return typeof window !== 'undefined';
}
function getNodeName(node) {
  if (isNode(node)) {
    return (node.nodeName || '').toLowerCase();
  }
  // Mocked nodes in testing environments may not be instances of Node. By
  // returning `#document` an infinite loop won't occur.
  // https://github.com/floating-ui/floating-ui/issues/2317
  return '#document';
}
function getWindow(node) {
  var _node$ownerDocument;
  return (node == null || (_node$ownerDocument = node.ownerDocument) == null ? void 0 : _node$ownerDocument.defaultView) || window;
}
function getDocumentElement(node) {
  var _ref;
  return (_ref = (isNode(node) ? node.ownerDocument : node.document) || window.document) == null ? void 0 : _ref.documentElement;
}
function isNode(value) {
  if (!hasWindow()) {
    return false;
  }
  return value instanceof Node || value instanceof getWindow(value).Node;
}
function isElement(value) {
  if (!hasWindow()) {
    return false;
  }
  return value instanceof Element || value instanceof getWindow(value).Element;
}
function isHTMLElement(value) {
  if (!hasWindow()) {
    return false;
  }
  return value instanceof HTMLElement || value instanceof getWindow(value).HTMLElement;
}
function isShadowRoot(value) {
  if (!hasWindow() || typeof ShadowRoot === 'undefined') {
    return false;
  }
  return value instanceof ShadowRoot || value instanceof getWindow(value).ShadowRoot;
}
const invalidOverflowDisplayValues = /*#__PURE__*/new Set(['inline', 'contents']);
function isOverflowElement(element) {
  const {
    overflow,
    overflowX,
    overflowY,
    display
  } = getComputedStyle(element);
  return /auto|scroll|overlay|hidden|clip/.test(overflow + overflowY + overflowX) && !invalidOverflowDisplayValues.has(display);
}
const tableElements = /*#__PURE__*/new Set(['table', 'td', 'th']);
function isTableElement(element) {
  return tableElements.has(getNodeName(element));
}
const topLayerSelectors = [':popover-open', ':modal'];
function isTopLayer(element) {
  return topLayerSelectors.some(selector => {
    try {
      return element.matches(selector);
    } catch (_e) {
      return false;
    }
  });
}
const transformProperties = ['transform', 'translate', 'scale', 'rotate', 'perspective'];
const willChangeValues = ['transform', 'translate', 'scale', 'rotate', 'perspective', 'filter'];
const containValues = ['paint', 'layout', 'strict', 'content'];
function isContainingBlock(elementOrCss) {
  const webkit = isWebKit();
  const css = isElement(elementOrCss) ? getComputedStyle(elementOrCss) : elementOrCss;

  // https://developer.mozilla.org/en-US/docs/Web/CSS/Containing_block#identifying_the_containing_block
  // https://drafts.csswg.org/css-transforms-2/#individual-transforms
  return transformProperties.some(value => css[value] ? css[value] !== 'none' : false) || (css.containerType ? css.containerType !== 'normal' : false) || !webkit && (css.backdropFilter ? css.backdropFilter !== 'none' : false) || !webkit && (css.filter ? css.filter !== 'none' : false) || willChangeValues.some(value => (css.willChange || '').includes(value)) || containValues.some(value => (css.contain || '').includes(value));
}
function getContainingBlock(element) {
  let currentNode = getParentNode(element);
  while (isHTMLElement(currentNode) && !isLastTraversableNode(currentNode)) {
    if (isContainingBlock(currentNode)) {
      return currentNode;
    } else if (isTopLayer(currentNode)) {
      return null;
    }
    currentNode = getParentNode(currentNode);
  }
  return null;
}
function isWebKit() {
  if (typeof CSS === 'undefined' || !CSS.supports) return false;
  return CSS.supports('-webkit-backdrop-filter', 'none');
}
const lastTraversableNodeNames = /*#__PURE__*/new Set(['html', 'body', '#document']);
function isLastTraversableNode(node) {
  return lastTraversableNodeNames.has(getNodeName(node));
}
function getComputedStyle(element) {
  return getWindow(element).getComputedStyle(element);
}
function getNodeScroll(element) {
  if (isElement(element)) {
    return {
      scrollLeft: element.scrollLeft,
      scrollTop: element.scrollTop
    };
  }
  return {
    scrollLeft: element.scrollX,
    scrollTop: element.scrollY
  };
}
function getParentNode(node) {
  if (getNodeName(node) === 'html') {
    return node;
  }
  const result =
  // Step into the shadow DOM of the parent of a slotted node.
  node.assignedSlot ||
  // DOM Element detected.
  node.parentNode ||
  // ShadowRoot detected.
  isShadowRoot(node) && node.host ||
  // Fallback.
  getDocumentElement(node);
  return isShadowRoot(result) ? result.host : result;
}
function getNearestOverflowAncestor(node) {
  const parentNode = getParentNode(node);
  if (isLastTraversableNode(parentNode)) {
    return node.ownerDocument ? node.ownerDocument.body : node.body;
  }
  if (isHTMLElement(parentNode) && isOverflowElement(parentNode)) {
    return parentNode;
  }
  return getNearestOverflowAncestor(parentNode);
}
function getOverflowAncestors(node, list, traverseIframes) {
  var _node$ownerDocument2;
  if (list === void 0) {
    list = [];
  }
  if (traverseIframes === void 0) {
    traverseIframes = true;
  }
  const scrollableAncestor = getNearestOverflowAncestor(node);
  const isBody = scrollableAncestor === ((_node$ownerDocument2 = node.ownerDocument) == null ? void 0 : _node$ownerDocument2.body);
  const win = getWindow(scrollableAncestor);
  if (isBody) {
    const frameElement = getFrameElement(win);
    return list.concat(win, win.visualViewport || [], isOverflowElement(scrollableAncestor) ? scrollableAncestor : [], frameElement && traverseIframes ? getOverflowAncestors(frameElement) : []);
  }
  return list.concat(scrollableAncestor, getOverflowAncestors(scrollableAncestor, [], traverseIframes));
}
function getFrameElement(win) {
  return win.parent && Object.getPrototypeOf(win.parent) ? win.frameElement : null;
}




/***/ }),

/***/ "./node_modules/@floating-ui/utils/dist/floating-ui.utils.mjs":
/*!********************************************************************!*\
  !*** ./node_modules/@floating-ui/utils/dist/floating-ui.utils.mjs ***!
  \********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   alignments: () => (/* binding */ alignments),
/* harmony export */   clamp: () => (/* binding */ clamp),
/* harmony export */   createCoords: () => (/* binding */ createCoords),
/* harmony export */   evaluate: () => (/* binding */ evaluate),
/* harmony export */   expandPaddingObject: () => (/* binding */ expandPaddingObject),
/* harmony export */   floor: () => (/* binding */ floor),
/* harmony export */   getAlignment: () => (/* binding */ getAlignment),
/* harmony export */   getAlignmentAxis: () => (/* binding */ getAlignmentAxis),
/* harmony export */   getAlignmentSides: () => (/* binding */ getAlignmentSides),
/* harmony export */   getAxisLength: () => (/* binding */ getAxisLength),
/* harmony export */   getExpandedPlacements: () => (/* binding */ getExpandedPlacements),
/* harmony export */   getOppositeAlignmentPlacement: () => (/* binding */ getOppositeAlignmentPlacement),
/* harmony export */   getOppositeAxis: () => (/* binding */ getOppositeAxis),
/* harmony export */   getOppositeAxisPlacements: () => (/* binding */ getOppositeAxisPlacements),
/* harmony export */   getOppositePlacement: () => (/* binding */ getOppositePlacement),
/* harmony export */   getPaddingObject: () => (/* binding */ getPaddingObject),
/* harmony export */   getSide: () => (/* binding */ getSide),
/* harmony export */   getSideAxis: () => (/* binding */ getSideAxis),
/* harmony export */   max: () => (/* binding */ max),
/* harmony export */   min: () => (/* binding */ min),
/* harmony export */   placements: () => (/* binding */ placements),
/* harmony export */   rectToClientRect: () => (/* binding */ rectToClientRect),
/* harmony export */   round: () => (/* binding */ round),
/* harmony export */   sides: () => (/* binding */ sides)
/* harmony export */ });
/**
 * Custom positioning reference element.
 * @see https://floating-ui.com/docs/virtual-elements
 */

const sides = ['top', 'right', 'bottom', 'left'];
const alignments = ['start', 'end'];
const placements = /*#__PURE__*/sides.reduce((acc, side) => acc.concat(side, side + "-" + alignments[0], side + "-" + alignments[1]), []);
const min = Math.min;
const max = Math.max;
const round = Math.round;
const floor = Math.floor;
const createCoords = v => ({
  x: v,
  y: v
});
const oppositeSideMap = {
  left: 'right',
  right: 'left',
  bottom: 'top',
  top: 'bottom'
};
const oppositeAlignmentMap = {
  start: 'end',
  end: 'start'
};
function clamp(start, value, end) {
  return max(start, min(value, end));
}
function evaluate(value, param) {
  return typeof value === 'function' ? value(param) : value;
}
function getSide(placement) {
  return placement.split('-')[0];
}
function getAlignment(placement) {
  return placement.split('-')[1];
}
function getOppositeAxis(axis) {
  return axis === 'x' ? 'y' : 'x';
}
function getAxisLength(axis) {
  return axis === 'y' ? 'height' : 'width';
}
const yAxisSides = /*#__PURE__*/new Set(['top', 'bottom']);
function getSideAxis(placement) {
  return yAxisSides.has(getSide(placement)) ? 'y' : 'x';
}
function getAlignmentAxis(placement) {
  return getOppositeAxis(getSideAxis(placement));
}
function getAlignmentSides(placement, rects, rtl) {
  if (rtl === void 0) {
    rtl = false;
  }
  const alignment = getAlignment(placement);
  const alignmentAxis = getAlignmentAxis(placement);
  const length = getAxisLength(alignmentAxis);
  let mainAlignmentSide = alignmentAxis === 'x' ? alignment === (rtl ? 'end' : 'start') ? 'right' : 'left' : alignment === 'start' ? 'bottom' : 'top';
  if (rects.reference[length] > rects.floating[length]) {
    mainAlignmentSide = getOppositePlacement(mainAlignmentSide);
  }
  return [mainAlignmentSide, getOppositePlacement(mainAlignmentSide)];
}
function getExpandedPlacements(placement) {
  const oppositePlacement = getOppositePlacement(placement);
  return [getOppositeAlignmentPlacement(placement), oppositePlacement, getOppositeAlignmentPlacement(oppositePlacement)];
}
function getOppositeAlignmentPlacement(placement) {
  return placement.replace(/start|end/g, alignment => oppositeAlignmentMap[alignment]);
}
const lrPlacement = ['left', 'right'];
const rlPlacement = ['right', 'left'];
const tbPlacement = ['top', 'bottom'];
const btPlacement = ['bottom', 'top'];
function getSideList(side, isStart, rtl) {
  switch (side) {
    case 'top':
    case 'bottom':
      if (rtl) return isStart ? rlPlacement : lrPlacement;
      return isStart ? lrPlacement : rlPlacement;
    case 'left':
    case 'right':
      return isStart ? tbPlacement : btPlacement;
    default:
      return [];
  }
}
function getOppositeAxisPlacements(placement, flipAlignment, direction, rtl) {
  const alignment = getAlignment(placement);
  let list = getSideList(getSide(placement), direction === 'start', rtl);
  if (alignment) {
    list = list.map(side => side + "-" + alignment);
    if (flipAlignment) {
      list = list.concat(list.map(getOppositeAlignmentPlacement));
    }
  }
  return list;
}
function getOppositePlacement(placement) {
  return placement.replace(/left|right|bottom|top/g, side => oppositeSideMap[side]);
}
function expandPaddingObject(padding) {
  return {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    ...padding
  };
}
function getPaddingObject(padding) {
  return typeof padding !== 'number' ? expandPaddingObject(padding) : {
    top: padding,
    right: padding,
    bottom: padding,
    left: padding
  };
}
function rectToClientRect(rect) {
  const {
    x,
    y,
    width,
    height
  } = rect;
  return {
    width,
    height,
    top: y,
    left: x,
    right: x + width,
    bottom: y + height,
    x,
    y
  };
}




/***/ }),

/***/ "./node_modules/lucide-react/dist/esm/Icon.js":
/*!****************************************************!*\
  !*** ./node_modules/lucide-react/dist/esm/Icon.js ***!
  \****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Icon)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _defaultAttributes_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./defaultAttributes.js */ "./node_modules/lucide-react/dist/esm/defaultAttributes.js");
/* harmony import */ var _shared_src_utils_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./shared/src/utils.js */ "./node_modules/lucide-react/dist/esm/shared/src/utils.js");
/**
 * @license lucide-react v0.544.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */





const Icon = (0,react__WEBPACK_IMPORTED_MODULE_0__.forwardRef)(
  ({
    color = "currentColor",
    size = 24,
    strokeWidth = 2,
    absoluteStrokeWidth,
    className = "",
    children,
    iconNode,
    ...rest
  }, ref) => (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(
    "svg",
    {
      ref,
      ..._defaultAttributes_js__WEBPACK_IMPORTED_MODULE_1__["default"],
      width: size,
      height: size,
      stroke: color,
      strokeWidth: absoluteStrokeWidth ? Number(strokeWidth) * 24 / Number(size) : strokeWidth,
      className: (0,_shared_src_utils_js__WEBPACK_IMPORTED_MODULE_2__.mergeClasses)("lucide", className),
      ...!children && !(0,_shared_src_utils_js__WEBPACK_IMPORTED_MODULE_2__.hasA11yProp)(rest) && { "aria-hidden": "true" },
      ...rest
    },
    [
      ...iconNode.map(([tag, attrs]) => (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(tag, attrs)),
      ...Array.isArray(children) ? children : [children]
    ]
  )
);


//# sourceMappingURL=Icon.js.map


/***/ }),

/***/ "./node_modules/lucide-react/dist/esm/createLucideIcon.js":
/*!****************************************************************!*\
  !*** ./node_modules/lucide-react/dist/esm/createLucideIcon.js ***!
  \****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ createLucideIcon)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _shared_src_utils_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./shared/src/utils.js */ "./node_modules/lucide-react/dist/esm/shared/src/utils.js");
/* harmony import */ var _Icon_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./Icon.js */ "./node_modules/lucide-react/dist/esm/Icon.js");
/**
 * @license lucide-react v0.544.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */





const createLucideIcon = (iconName, iconNode) => {
  const Component = (0,react__WEBPACK_IMPORTED_MODULE_0__.forwardRef)(
    ({ className, ...props }, ref) => (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_Icon_js__WEBPACK_IMPORTED_MODULE_2__["default"], {
      ref,
      iconNode,
      className: (0,_shared_src_utils_js__WEBPACK_IMPORTED_MODULE_1__.mergeClasses)(
        `lucide-${(0,_shared_src_utils_js__WEBPACK_IMPORTED_MODULE_1__.toKebabCase)((0,_shared_src_utils_js__WEBPACK_IMPORTED_MODULE_1__.toPascalCase)(iconName))}`,
        `lucide-${iconName}`,
        className
      ),
      ...props
    })
  );
  Component.displayName = (0,_shared_src_utils_js__WEBPACK_IMPORTED_MODULE_1__.toPascalCase)(iconName);
  return Component;
};


//# sourceMappingURL=createLucideIcon.js.map


/***/ }),

/***/ "./node_modules/lucide-react/dist/esm/defaultAttributes.js":
/*!*****************************************************************!*\
  !*** ./node_modules/lucide-react/dist/esm/defaultAttributes.js ***!
  \*****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ defaultAttributes)
/* harmony export */ });
/**
 * @license lucide-react v0.544.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */

var defaultAttributes = {
  xmlns: "http://www.w3.org/2000/svg",
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round"
};


//# sourceMappingURL=defaultAttributes.js.map


/***/ }),

/***/ "./node_modules/lucide-react/dist/esm/icons/minus.js":
/*!***********************************************************!*\
  !*** ./node_modules/lucide-react/dist/esm/icons/minus.js ***!
  \***********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   __iconNode: () => (/* binding */ __iconNode),
/* harmony export */   "default": () => (/* binding */ Minus)
/* harmony export */ });
/* harmony import */ var _createLucideIcon_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../createLucideIcon.js */ "./node_modules/lucide-react/dist/esm/createLucideIcon.js");
/**
 * @license lucide-react v0.544.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */



const __iconNode = [["path", { d: "M5 12h14", key: "1ays0h" }]];
const Minus = (0,_createLucideIcon_js__WEBPACK_IMPORTED_MODULE_0__["default"])("minus", __iconNode);


//# sourceMappingURL=minus.js.map


/***/ }),

/***/ "./node_modules/lucide-react/dist/esm/icons/plus.js":
/*!**********************************************************!*\
  !*** ./node_modules/lucide-react/dist/esm/icons/plus.js ***!
  \**********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   __iconNode: () => (/* binding */ __iconNode),
/* harmony export */   "default": () => (/* binding */ Plus)
/* harmony export */ });
/* harmony import */ var _createLucideIcon_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../createLucideIcon.js */ "./node_modules/lucide-react/dist/esm/createLucideIcon.js");
/**
 * @license lucide-react v0.544.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */



const __iconNode = [
  ["path", { d: "M5 12h14", key: "1ays0h" }],
  ["path", { d: "M12 5v14", key: "s699le" }]
];
const Plus = (0,_createLucideIcon_js__WEBPACK_IMPORTED_MODULE_0__["default"])("plus", __iconNode);


//# sourceMappingURL=plus.js.map


/***/ }),

/***/ "./node_modules/lucide-react/dist/esm/shared/src/utils.js":
/*!****************************************************************!*\
  !*** ./node_modules/lucide-react/dist/esm/shared/src/utils.js ***!
  \****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   hasA11yProp: () => (/* binding */ hasA11yProp),
/* harmony export */   mergeClasses: () => (/* binding */ mergeClasses),
/* harmony export */   toCamelCase: () => (/* binding */ toCamelCase),
/* harmony export */   toKebabCase: () => (/* binding */ toKebabCase),
/* harmony export */   toPascalCase: () => (/* binding */ toPascalCase)
/* harmony export */ });
/**
 * @license lucide-react v0.544.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */

const toKebabCase = (string) => string.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
const toCamelCase = (string) => string.replace(
  /^([A-Z])|[\s-_]+(\w)/g,
  (match, p1, p2) => p2 ? p2.toUpperCase() : p1.toLowerCase()
);
const toPascalCase = (string) => {
  const camelCase = toCamelCase(string);
  return camelCase.charAt(0).toUpperCase() + camelCase.slice(1);
};
const mergeClasses = (...classes) => classes.filter((className, index, array) => {
  return Boolean(className) && className.trim() !== "" && array.indexOf(className) === index;
}).join(" ").trim();
const hasA11yProp = (props) => {
  for (const prop in props) {
    if (prop.startsWith("aria-") || prop === "role" || prop === "title") {
      return true;
    }
  }
};


//# sourceMappingURL=utils.js.map


/***/ }),

/***/ "./node_modules/react-dom/client.js":
/*!******************************************!*\
  !*** ./node_modules/react-dom/client.js ***!
  \******************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



var m = __webpack_require__(/*! react-dom */ "react-dom");
if (false) // removed by dead control flow
{} else {
  var i = m.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
  exports.createRoot = function(c, o) {
    i.usingClientEntryPoint = true;
    try {
      return m.createRoot(c, o);
    } finally {
      i.usingClientEntryPoint = false;
    }
  };
  exports.hydrateRoot = function(c, h, o) {
    i.usingClientEntryPoint = true;
    try {
      return m.hydrateRoot(c, h, o);
    } finally {
      i.usingClientEntryPoint = false;
    }
  };
}


/***/ }),

/***/ "./src/frontend/api/http.ts":
/*!**********************************!*\
  !*** ./src/frontend/api/http.ts ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   j: () => (/* binding */ j)
/* harmony export */ });
const DEBUG = false; // flip to false to disable logging

function getHeadersAsRecord(headers) {
  const out = {};
  headers.forEach((value, key) => {
    out[key] = value;
  });
  return out;
}
async function j(path, init) {
  const url = window.DMN_PUBLIC_BOOT.restUrl + path;
  const started = performance.now();
  const res = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {})
    }
  });
  let data;
  try {
    data = await res.clone().json();
  } catch {
    data = await res.text();
  }
  if (DEBUG) {
    console.groupCollapsed(`%c[DMN]%c ${init?.method || 'GET'} ${path} %c${res.status}`, 'color:#6DA8A6;font-weight:600', 'color:inherit', `color:${res.ok ? '#16a34a' : '#dc2626'}`);
    console.log('Request:', {
      url,
      init
    });
    console.log('Response headers:', getHeadersAsRecord(res.headers));
    console.log('Response body:', data);
    console.log('Duration:', Math.round(performance.now() - started) + 'ms');
    console.groupEnd();
  }
  if (!res.ok) {
    throw new Error(data && (data.message || data.error) || `HTTP ${res.status}`);
  }
  return data;
}

/***/ }),

/***/ "./src/frontend/api/public.ts":
/*!************************************!*\
  !*** ./src/frontend/api/public.ts ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   checkAvailability: () => (/* binding */ checkAvailability),
/* harmony export */   createBooking: () => (/* binding */ createBooking),
/* harmony export */   getBookingTypes: () => (/* binding */ getBookingTypes),
/* harmony export */   getPackages: () => (/* binding */ getPackages),
/* harmony export */   getVenues: () => (/* binding */ getVenues)
/* harmony export */ });
/* harmony import */ var _http__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./http */ "./src/frontend/api/http.ts");


/* ---------- Venues ---------- */

function getVenues(q = {}) {
  const qs = new URLSearchParams(q);
  return (0,_http__WEBPACK_IMPORTED_MODULE_0__.j)('venues' + (qs.toString() ? `?${qs}` : ''));
}

/* ---------- Packages ---------- */

function getPackages(venueId) {
  return (0,_http__WEBPACK_IMPORTED_MODULE_0__.j)('packages?venue_id=' + encodeURIComponent(venueId));
}

/* ---------- Availability (DMN booking-availability) ---------- */
// I keep all fields optional, so I never need to send `null`; callers can conditionally spread keys.

// The PHP proxy usually wraps the DMN result in { data: { payload: {...}, ... }, status: number }.
// I model the inner `payload` exactly how we consume it elsewhere.

function checkAvailability(p, fields) {
  const qs = fields ? `?fields=${encodeURIComponent(fields)}` : '';
  return (0,_http__WEBPACK_IMPORTED_MODULE_0__.j)('booking-availability' + qs, {
    method: 'POST',
    body: JSON.stringify(p)
  });
}
function getBookingTypes(params) {
  const qs = new URLSearchParams();
  qs.set('venue_id', params.venueId);
  if (params.numPeople) qs.set('num_people', String(params.numPeople));
  if (params.date) qs.set('date', params.date);
  return (0,_http__WEBPACK_IMPORTED_MODULE_0__.j)('booking-types?' + qs.toString());
}

/* ---------- Create Booking ---------- */

function createBooking(p) {
  return (0,_http__WEBPACK_IMPORTED_MODULE_0__.j)('bookings', {
    method: 'POST',
    body: JSON.stringify(p)
  });
}

/***/ }),

/***/ "./src/frontend/app/WidgetProvider.tsx":
/*!*********************************************!*\
  !*** ./src/frontend/app/WidgetProvider.tsx ***!
  \*********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   WidgetProvider: () => (/* binding */ WidgetProvider),
/* harmony export */   useWidget: () => (/* binding */ useWidget),
/* harmony export */   useWidgetConfig: () => (/* binding */ useWidgetConfig),
/* harmony export */   useWidgetDispatch: () => (/* binding */ useWidgetDispatch),
/* harmony export */   useWidgetState: () => (/* binding */ useWidgetState)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _state__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./state */ "./src/frontend/app/state.ts");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__);



const WidgetCtx = (0,react__WEBPACK_IMPORTED_MODULE_0__.createContext)(null);
function WidgetProvider({
  children,
  ...config
}) {
  // useReducer initializer keeps this tiny (no extra useMemo for boot state)
  const [state, dispatch] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useReducer)(_state__WEBPACK_IMPORTED_MODULE_1__.reducer, config, cfg => {
    var _cfg$forcedVenueId;
    return {
      ..._state__WEBPACK_IMPORTED_MODULE_1__.initialState,
      step: cfg.forcedVenueId ? 'venue' : 'venue',
      venueId: (_cfg$forcedVenueId = cfg.forcedVenueId) !== null && _cfg$forcedVenueId !== void 0 ? _cfg$forcedVenueId : null
    };
  });

  // small memo so consumers don't re-render more than needed
  const value = (0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => ({
    state,
    dispatch,
    config
  }), [state, config.venueGroup, config.forcedVenueId, config.corpThreshold, config.corpEnquiryUrl, config.returnUrl]);
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)(WidgetCtx.Provider, {
    value: value,
    children: children
  });
}

/** Single hook */
function useWidget() {
  const ctx = (0,react__WEBPACK_IMPORTED_MODULE_0__.useContext)(WidgetCtx);
  if (!ctx) throw new Error('useWidget must be used within <WidgetProvider>');
  return ctx;
}

/** Back-compat tiny helpers (optional) */
const useWidgetState = () => useWidget().state;
const useWidgetDispatch = () => useWidget().dispatch;
const useWidgetConfig = () => useWidget().config;

/***/ }),

/***/ "./src/frontend/app/WidgetRoot.tsx":
/*!*****************************************!*\
  !*** ./src/frontend/app/WidgetRoot.tsx ***!
  \*****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ WidgetRoot)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _WidgetProvider__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./WidgetProvider */ "./src/frontend/app/WidgetProvider.tsx");
/* harmony import */ var _base_ui_components_react_accordion__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @base-ui-components/react/accordion */ "./node_modules/@base-ui-components/react/esm/accordion/root/AccordionRoot.js");
/* harmony import */ var _base_ui_components_react_accordion__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @base-ui-components/react/accordion */ "./node_modules/@base-ui-components/react/esm/accordion/item/AccordionItem.js");
/* harmony import */ var _base_ui_components_react_accordion__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @base-ui-components/react/accordion */ "./node_modules/@base-ui-components/react/esm/accordion/header/AccordionHeader.js");
/* harmony import */ var _base_ui_components_react_accordion__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @base-ui-components/react/accordion */ "./node_modules/@base-ui-components/react/esm/accordion/trigger/AccordionTrigger.js");
/* harmony import */ var _base_ui_components_react_accordion__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @base-ui-components/react/accordion */ "./node_modules/@base-ui-components/react/esm/accordion/panel/AccordionPanel.js");
/* harmony import */ var lucide_react__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! lucide-react */ "./node_modules/lucide-react/dist/esm/icons/plus.js");
/* harmony import */ var _components_steps_VenueStep__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./components/steps/VenueStep */ "./src/frontend/app/components/steps/VenueStep.tsx");
/* harmony import */ var _components_steps_PartySizeStep__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./components/steps/PartySizeStep */ "./src/frontend/app/components/steps/PartySizeStep.tsx");
/* harmony import */ var _hooks_useVenues__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./hooks/useVenues */ "./src/frontend/app/hooks/useVenues.ts");
/* harmony import */ var _components_steps_PackagesStep__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./components/steps/PackagesStep */ "./src/frontend/app/components/steps/PackagesStep.tsx");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__);









function WidgetRoot(props) {
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)("div", {
    className: "dmn-widget",
    role: "form",
    "aria-labelledby": "dmn-title",
    children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_WidgetProvider__WEBPACK_IMPORTED_MODULE_1__.WidgetProvider, {
      ...props,
      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(WidgetInner, {})
    })
  });
}
function WidgetInner() {
  const {
    venueGroup,
    forcedVenueId
  } = (0,_WidgetProvider__WEBPACK_IMPORTED_MODULE_1__.useWidgetConfig)();
  const {
    venues,
    loading,
    error
  } = (0,_hooks_useVenues__WEBPACK_IMPORTED_MODULE_10__.useVenues)(venueGroup, !!forcedVenueId);
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsxs)(_base_ui_components_react_accordion__WEBPACK_IMPORTED_MODULE_2__.AccordionRoot, {
    className: "accordion",
    openMultiple: true,
    defaultValue: ['step1', 'step2', 'step3', 'step4'],
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsxs)(_base_ui_components_react_accordion__WEBPACK_IMPORTED_MODULE_3__.AccordionItem, {
      className: "accordion__item",
      value: "step1",
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_base_ui_components_react_accordion__WEBPACK_IMPORTED_MODULE_4__.AccordionHeader, {
        className: "accordion__header",
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsxs)(_base_ui_components_react_accordion__WEBPACK_IMPORTED_MODULE_5__.AccordionTrigger, {
          className: "accordion__trigger",
          children: ["1. Secure your spot", /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_7__["default"], {
            className: "accordion__icon"
          })]
        })
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsxs)(_base_ui_components_react_accordion__WEBPACK_IMPORTED_MODULE_6__.AccordionPanel, {
        className: "accordion__panel",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_components_steps_PartySizeStep__WEBPACK_IMPORTED_MODULE_9__.PartySizeStep, {}), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_components_steps_VenueStep__WEBPACK_IMPORTED_MODULE_8__.VenueStep, {
          venues: venues,
          initialLoading: loading,
          error: error,
          forcedVenueId: forcedVenueId
        })]
      })]
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsxs)(_base_ui_components_react_accordion__WEBPACK_IMPORTED_MODULE_3__.AccordionItem, {
      className: "accordion__item",
      value: "step2",
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_base_ui_components_react_accordion__WEBPACK_IMPORTED_MODULE_4__.AccordionHeader, {
        className: "accordion__header",
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsxs)(_base_ui_components_react_accordion__WEBPACK_IMPORTED_MODULE_5__.AccordionTrigger, {
          className: "accordion__trigger",
          children: ["3. Choose your Add-ons", /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_7__["default"], {
            className: "accordion__icon"
          })]
        })
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_base_ui_components_react_accordion__WEBPACK_IMPORTED_MODULE_6__.AccordionPanel, {
        className: "accordion__panel",
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_components_steps_PackagesStep__WEBPACK_IMPORTED_MODULE_11__.PackagesStep, {})
      })]
    })]
  });
}

/***/ }),

/***/ "./src/frontend/app/components/StepShell.tsx":
/*!***************************************************!*\
  !*** ./src/frontend/app/components/StepShell.tsx ***!
  \***************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   StepShell: () => (/* binding */ StepShell)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _WidgetProvider__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../WidgetProvider */ "./src/frontend/app/WidgetProvider.tsx");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__);



const StepShell = ({
  className,
  children
}) => {
  const state = (0,_WidgetProvider__WEBPACK_IMPORTED_MODULE_1__.useWidgetState)();
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsxs)("div", {
    className: `step step--${className}`,
    children: [state.error && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)("p", {
      className: "step__error",
      role: "alert",
      children: state.error
    }), children]
  });
};

/***/ }),

/***/ "./src/frontend/app/components/steps/PackagesStep.tsx":
/*!************************************************************!*\
  !*** ./src/frontend/app/components/steps/PackagesStep.tsx ***!
  \************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   PackagesStep: () => (/* binding */ PackagesStep)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _StepShell__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../StepShell */ "./src/frontend/app/components/StepShell.tsx");
/* harmony import */ var _WidgetProvider__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../WidgetProvider */ "./src/frontend/app/WidgetProvider.tsx");
/* harmony import */ var _api_public__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../../api/public */ "./src/frontend/api/public.ts");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__);





function PackagesStep() {
  const state = (0,_WidgetProvider__WEBPACK_IMPORTED_MODULE_2__.useWidgetState)();
  const dispatch = (0,_WidgetProvider__WEBPACK_IMPORTED_MODULE_2__.useWidgetDispatch)();
  const [packages, setPackages] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)([]);
  const [loading, setLoading] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
  const [error, setError] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(null);

  // Load packages whenever the selected venue (DMN ID) changes
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    // If no venue is selected, clear packages and bail out
    if (!state.venueId) {
      setPackages([]);
      return;
    }
    async function fetchPackages() {
      setLoading(true);
      setError(null);
      try {
        const res = await (0,_api_public__WEBPACK_IMPORTED_MODULE_3__.getPackages)(String(state.venueId));

        // Map API data (id, label, …) to UiPackageItem
        const raw = res.data || [];
        const mapped = raw.map(pkg => {
          var _pkg$description, _pkg$priceText, _pkg$image_url, _pkg$visible;
          return {
            id: pkg.id,
            name: pkg.label,
            // use label as the display name
            description: (_pkg$description = pkg.description) !== null && _pkg$description !== void 0 ? _pkg$description : '',
            priceText: (_pkg$priceText = pkg.priceText) !== null && _pkg$priceText !== void 0 ? _pkg$priceText : '',
            image_url: (_pkg$image_url = pkg.image_url) !== null && _pkg$image_url !== void 0 ? _pkg$image_url : null,
            visible: (_pkg$visible = pkg.visible) !== null && _pkg$visible !== void 0 ? _pkg$visible : true
          };
        });
        setPackages(mapped);
        dispatch({
          type: 'SET_PACKAGES',
          value: mapped
        });
      } catch (e) {
        setError(e.message || 'Failed to load packages');
        setPackages([]);
      } finally {
        setLoading(false);
      }
    }
    fetchPackages();
  }, [state.venueId, dispatch]);
  const toggle = (id, checked) => {
    const next = new Set(state.packagesSelected);
    if (checked) {
      next.add(id);
    } else {
      next.delete(id);
    }
    dispatch({
      type: 'SET_PACKAGES_SELECTED',
      value: Array.from(next)
    });
  };
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsxs)(_StepShell__WEBPACK_IMPORTED_MODULE_1__.StepShell, {
    className: "packages",
    children: [loading && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)("p", {
      children: "Loading packages\u2026"
    }), !loading && error && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)("p", {
      className: "step__error",
      children: error
    }), !loading && !error && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)("div", {
      className: "package-grid",
      children: packages.map(pkg => {
        const isSelected = state.packagesSelected.includes(pkg.id);
        return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsxs)("label", {
          className: `package-card${isSelected ? ' is-selected' : ''}`,
          children: [pkg.image_url && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)("div", {
            className: "package-card__image-wrapper",
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)("img", {
              src: pkg.image_url,
              alt: pkg.name,
              className: "package-card__image"
            })
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsxs)("article", {
            className: "package-card__article",
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)("h6", {
              className: "package-card__name",
              children: pkg.name
            }), pkg.description && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)("p", {
              className: "package-card__description",
              dangerouslySetInnerHTML: {
                __html: pkg.description
              }
            }), pkg.priceText && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)("p", {
              className: "package-card__price",
              children: pkg.priceText
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)("span", {
              className: "package-card__button",
              children: isSelected ? 'Selected' : 'Select'
            })]
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)("input", {
            type: "checkbox",
            className: "package-card__checkbox",
            checked: isSelected,
            onChange: e => toggle(pkg.id, e.target.checked)
          })]
        }, pkg.id);
      })
    })]
  });
}

/***/ }),

/***/ "./src/frontend/app/components/steps/PartySizeStep.tsx":
/*!*************************************************************!*\
  !*** ./src/frontend/app/components/steps/PartySizeStep.tsx ***!
  \*************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   PartySizeStep: () => (/* binding */ PartySizeStep),
/* harmony export */   "default": () => (/* binding */ ExampleNumberField)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _WidgetProvider__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../WidgetProvider */ "./src/frontend/app/WidgetProvider.tsx");
/* harmony import */ var _base_ui_components_react_number_field__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @base-ui-components/react/number-field */ "./node_modules/@base-ui-components/react/esm/number-field/root/NumberFieldRoot.js");
/* harmony import */ var _base_ui_components_react_number_field__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @base-ui-components/react/number-field */ "./node_modules/@base-ui-components/react/esm/number-field/group/NumberFieldGroup.js");
/* harmony import */ var _base_ui_components_react_number_field__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @base-ui-components/react/number-field */ "./node_modules/@base-ui-components/react/esm/number-field/decrement/NumberFieldDecrement.js");
/* harmony import */ var _base_ui_components_react_number_field__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @base-ui-components/react/number-field */ "./node_modules/@base-ui-components/react/esm/number-field/input/NumberFieldInput.js");
/* harmony import */ var _base_ui_components_react_number_field__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @base-ui-components/react/number-field */ "./node_modules/@base-ui-components/react/esm/number-field/increment/NumberFieldIncrement.js");
/* harmony import */ var lucide_react__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! lucide-react */ "./node_modules/lucide-react/dist/esm/icons/minus.js");
/* harmony import */ var lucide_react__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! lucide-react */ "./node_modules/lucide-react/dist/esm/icons/plus.js");
/* harmony import */ var _StepShell__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../StepShell */ "./src/frontend/app/components/StepShell.tsx");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__);






function PartySizeStep() {
  const {
    partySize
  } = (0,_WidgetProvider__WEBPACK_IMPORTED_MODULE_1__.useWidgetState)();
  const dispatch = (0,_WidgetProvider__WEBPACK_IMPORTED_MODULE_1__.useWidgetDispatch)();
  const id = (0,react__WEBPACK_IMPORTED_MODULE_0__.useId)();

  // I seed a starting value so the field is controlled from mount.
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    if (partySize == null) {
      dispatch({
        type: 'SET_PARTY_SIZE',
        size: 2
      });
    }
  }, [partySize, dispatch]);

  // Base UI calls me with number | null on every change (typing & +/-).
  const handleValueChange = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(value => {
    const n = value == null ? 1 : Math.floor(value);
    const clamped = Math.min(12, Math.max(1, n));
    dispatch({
      type: 'SET_PARTY_SIZE',
      size: clamped
    });
  }, [dispatch]);
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsxs)(_StepShell__WEBPACK_IMPORTED_MODULE_9__.StepShell, {
    className: "party-size",
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsxs)("p", {
      className: "step__label",
      children: ["Whats your", /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)("br", {}), "party size?"]
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_base_ui_components_react_number_field__WEBPACK_IMPORTED_MODULE_2__.NumberFieldRoot, {
      id: id,
      value: partySize !== null && partySize !== void 0 ? partySize : 2 // controlled
      ,
      min: 1,
      max: 12,
      step: 1,
      className: "timepicker",
      onValueChange: handleValueChange,
      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsxs)(_base_ui_components_react_number_field__WEBPACK_IMPORTED_MODULE_3__.NumberFieldGroup, {
        className: "timepicker__group",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_base_ui_components_react_number_field__WEBPACK_IMPORTED_MODULE_4__.NumberFieldDecrement, {
          className: "timepicker__decrement",
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_7__["default"], {})
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_base_ui_components_react_number_field__WEBPACK_IMPORTED_MODULE_5__.NumberFieldInput, {
          className: "timepicker__input"
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_base_ui_components_react_number_field__WEBPACK_IMPORTED_MODULE_6__.NumberFieldIncrement, {
          className: "timepicker__increment",
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_8__["default"], {})
        })]
      })
    })]
  });
}
function ExampleNumberField() {}

/***/ }),

/***/ "./src/frontend/app/components/steps/VenueStep.tsx":
/*!*********************************************************!*\
  !*** ./src/frontend/app/components/steps/VenueStep.tsx ***!
  \*********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   VenueStep: () => (/* binding */ VenueStep)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _StepShell__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../StepShell */ "./src/frontend/app/components/StepShell.tsx");
/* harmony import */ var _WidgetProvider__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../WidgetProvider */ "./src/frontend/app/WidgetProvider.tsx");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__);




function VenueStep({
  venues,
  initialLoading,
  error,
  forcedVenueId
}) {
  const state = (0,_WidgetProvider__WEBPACK_IMPORTED_MODULE_2__.useWidgetState)();
  const dispatch = (0,_WidgetProvider__WEBPACK_IMPORTED_MODULE_2__.useWidgetDispatch)();

  // If a venue is forced (via config), we don’t show this step.
  if (forcedVenueId) return null;
  const handleChange = e => {
    const id = e.target.value || '';
    // 1) Set the new venue
    dispatch({
      type: 'SET_VENUE',
      id: id || null
    });

    // 2) Clear dependent selections so later steps re-compute from DMN:
    //    - Date suggestions (DateStep) will fetch `fields=date` when shown
    //    - Types list (TypeStep) will fetch via your WP route when shown
    //    - Time suggestions (TimeStep) will prefetch once date+type are set
    dispatch({
      type: 'SET_DATE',
      date: ''
    });
    dispatch({
      type: 'SET_TIME',
      value: ''
    });
    dispatch({
      type: 'SET_TYPE',
      value: ''
    });

    // NOTE: intentionally NO raw `booking-availability` call here.
    // DMN-recommended pattern: compute only what you need with `fields=…`
    // on the specific steps that need it.
  };
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)(_StepShell__WEBPACK_IMPORTED_MODULE_1__.StepShell, {
    className: "venue",
    children: [initialLoading && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("p", {
      children: "Loading venues\u2026"
    }), error && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("p", {
      className: "step__error",
      children: error
    }), !initialLoading && !error && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.Fragment, {
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("p", {
        className: "step__label",
        children: "Select a venue"
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("div", {
        className: "select-wrapper",
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)("select", {
          name: "venues",
          className: "select",
          value: state.venueId || '',
          onChange: handleChange,
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("option", {
            value: "",
            disabled: true,
            children: "Choose\u2026"
          }), venues.map(v => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("option", {
            value: v._id,
            children: v.name || v.title
          }, v._id))]
        })
      })]
    })]
  });
}

/***/ }),

/***/ "./src/frontend/app/hooks/useVenues.ts":
/*!*********************************************!*\
  !*** ./src/frontend/app/hooks/useVenues.ts ***!
  \*********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   useVenues: () => (/* binding */ useVenues)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _api_public__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../api/public */ "./src/frontend/api/public.ts");


function useVenues(venueGroup, skip = false) {
  const [venues, setVenues] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)([]);
  const [loading, setLoading] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
  const [error, setError] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(null);
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    if (skip) return;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await (0,_api_public__WEBPACK_IMPORTED_MODULE_1__.getVenues)({
          venue_group: venueGroup,
          fields: 'path,name,title'
        });
        setVenues(res.data.payload?.pages || []);
      } catch (e) {
        setError(e?.message || 'Failed to load venues');
      } finally {
        setLoading(false);
      }
    })();
  }, [venueGroup, skip]);
  return {
    venues,
    loading,
    error
  };
}

/***/ }),

/***/ "./src/frontend/app/state.ts":
/*!***********************************!*\
  !*** ./src/frontend/app/state.ts ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   FLOW_ORDER: () => (/* binding */ FLOW_ORDER),
/* harmony export */   initialState: () => (/* binding */ initialState),
/* harmony export */   reducer: () => (/* binding */ reducer)
/* harmony export */ });
// state.ts

// ---- Steps in DMN-recommended order ----

// summary + countdown

// Keep Customer in sync with how it's used in the widget (message + gdpr supported)

// Single source of truth for flow order
const FLOW_ORDER = ['venue', 'type', 'time', 'packages', 'details', 'review'];

// ---- Defaults ----
// NOTE: Widget sets the first step dynamically:
// - forcedVenueId ? 'stage1' : 'venue'
const initialState = {
  step: 'venue',
  venueId: null,
  partySize: 2,
  date: null,
  time: null,
  bookingType: null,
  avail: null,
  suggestions: [],
  packages: [],
  packagesSelected: [],
  customer: {
    name: '',
    email: ''
  },
  error: null,
  submitting: false
};

// ---- Actions ----

// ---- Reducer ----
function reducer(s, a) {
  var _a$value;
  switch (a.type) {
    case 'SET_VENUE':
      return {
        ...s,
        venueId: a.id,
        avail: null,
        suggestions: []
      };
    case 'SET_PARTY_SIZE':
      {
        const size = Math.max(1, a.size);
        // Capacity affects availability/time; clear them
        return {
          ...s,
          partySize: size,
          time: null,
          avail: null,
          suggestions: []
        };
      }
    case 'SET_DATE':
      {
        const dateChanged = a.date !== s.date;
        if (!dateChanged) return s;
        // Date change invalidates previously selected time/availability
        return {
          ...s,
          date: a.date,
          // YYYY-MM-DD or null
          time: null,
          avail: null,
          suggestions: []
        };
      }
    case 'SET_TYPE':
      // Changing type usually affects availability/time
      return {
        ...s,
        bookingType: a.value,
        time: null,
        avail: null,
        suggestions: []
      };
    case 'SET_TIME':
      return {
        ...s,
        time: (_a$value = a.value) !== null && _a$value !== void 0 ? _a$value : null
      };
    case 'SET_AVAIL':
      return {
        ...s,
        avail: a.value || null
      };
    case 'SET_SUGGESTIONS':
      return {
        ...s,
        suggestions: a.value || []
      };
    case 'SET_PACKAGES':
      return {
        ...s,
        packages: a.value || []
      };
    case 'SET_PACKAGES_SELECTED':
      return {
        ...s,
        packagesSelected: a.value || []
      };
    case 'SET_CUSTOMER':
      return {
        ...s,
        customer: a.value
      };
    case 'START_REVIEW_TIMER':
      return {
        ...s,
        reviewDeadline: a.deadline
      };
    case 'SUBMIT_START':
      return {
        ...s,
        submitting: true,
        error: null
      };
    case 'SUBMIT_END':
      return {
        ...s,
        submitting: false
      };
    case 'ERROR':
      return {
        ...s,
        error: a.message
      };
    case 'NEXT':
      {
        const idx = FLOW_ORDER.indexOf(s.step);
        const nextIdx = Math.min(FLOW_ORDER.length - 1, idx + 1);
        return {
          ...s,
          step: FLOW_ORDER[nextIdx]
        };
      }
    case 'BACK':
      {
        const idx = FLOW_ORDER.indexOf(s.step);
        const prevIdx = Math.max(0, idx - 1);
        return {
          ...s,
          step: FLOW_ORDER[prevIdx]
        };
      }
    default:
      return s;
  }
}

/***/ }),

/***/ "./src/frontend/index.tsx":
/*!********************************!*\
  !*** ./src/frontend/index.tsx ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react_dom_client__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react-dom/client */ "./node_modules/react-dom/client.js");
/* harmony import */ var _app_WidgetRoot__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./app/WidgetRoot */ "./src/frontend/app/WidgetRoot.tsx");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__);




function boot(el) {
  const props = {
    venueGroup: el.dataset.venueGroup || undefined,
    forcedVenueId: el.dataset.venueId || undefined,
    corpThreshold: Number(el.dataset.corpThreshold || 20),
    corpEnquiryUrl: el.dataset.corpEnquiryUrl || undefined,
    returnUrl: el.dataset.returnUrl || undefined
  };
  (0,react_dom_client__WEBPACK_IMPORTED_MODULE_1__.createRoot)(el).render(/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(_app_WidgetRoot__WEBPACK_IMPORTED_MODULE_2__["default"], {
    ...props
  }));
}
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.dmn-widget-root').forEach(boot);
});

/***/ }),

/***/ "./src/frontend/styles/index.scss":
/*!****************************************!*\
  !*** ./src/frontend/styles/index.scss ***!
  \****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ }),

/***/ "react":
/*!************************!*\
  !*** external "React" ***!
  \************************/
/***/ ((module) => {

module.exports = window["React"];

/***/ }),

/***/ "react-dom":
/*!***************************!*\
  !*** external "ReactDOM" ***!
  \***************************/
/***/ ((module) => {

module.exports = window["ReactDOM"];

/***/ }),

/***/ "react/jsx-runtime":
/*!**********************************!*\
  !*** external "ReactJSXRuntime" ***!
  \**********************************/
/***/ ((module) => {

module.exports = window["ReactJSXRuntime"];

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/create fake namespace object */
/******/ 	(() => {
/******/ 		var getProto = Object.getPrototypeOf ? (obj) => (Object.getPrototypeOf(obj)) : (obj) => (obj.__proto__);
/******/ 		var leafPrototypes;
/******/ 		// create a fake namespace object
/******/ 		// mode & 1: value is a module id, require it
/******/ 		// mode & 2: merge all properties of value into the ns
/******/ 		// mode & 4: return value when already ns object
/******/ 		// mode & 16: return value when it's Promise-like
/******/ 		// mode & 8|1: behave like require
/******/ 		__webpack_require__.t = function(value, mode) {
/******/ 			if(mode & 1) value = this(value);
/******/ 			if(mode & 8) return value;
/******/ 			if(typeof value === 'object' && value) {
/******/ 				if((mode & 4) && value.__esModule) return value;
/******/ 				if((mode & 16) && typeof value.then === 'function') return value;
/******/ 			}
/******/ 			var ns = Object.create(null);
/******/ 			__webpack_require__.r(ns);
/******/ 			var def = {};
/******/ 			leafPrototypes = leafPrototypes || [null, getProto({}), getProto([]), getProto(getProto)];
/******/ 			for(var current = mode & 2 && value; (typeof current == 'object' || typeof current == 'function') && !~leafPrototypes.indexOf(current); current = getProto(current)) {
/******/ 				Object.getOwnPropertyNames(current).forEach((key) => (def[key] = () => (value[key])));
/******/ 			}
/******/ 			def['default'] = () => (value);
/******/ 			__webpack_require__.d(ns, def);
/******/ 			return ns;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
/*!*******************************!*\
  !*** ./src/frontend/index.ts ***!
  \*******************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _styles_index_scss__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./styles/index.scss */ "./src/frontend/styles/index.scss");
/* harmony import */ var _index_tsx__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./index.tsx */ "./src/frontend/index.tsx");


})();

/******/ })()
;
//# sourceMappingURL=index.ts.js.map