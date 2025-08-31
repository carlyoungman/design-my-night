/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

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
const DEBUG = true; // flip to false to disable logging

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

function getPackages(venue_id) {
  return (0,_http__WEBPACK_IMPORTED_MODULE_0__.j)(`/wp-json/dmn/v1/packages?venue_id=${encodeURIComponent(venue_id)}`);
}
function getBookingTypes(venue_id) {
  return (0,_http__WEBPACK_IMPORTED_MODULE_0__.j)(`/wp-json/dmn/v1/booking-types?venue_id=${encodeURIComponent(venue_id)}`);
}
function getVenues(q = {}) {
  const qs = new URLSearchParams(q);
  return (0,_http__WEBPACK_IMPORTED_MODULE_0__.j)('venues' + (qs.toString() ? `?${qs}` : ''));
}
function checkAvailability(p) {
  return (0,_http__WEBPACK_IMPORTED_MODULE_0__.j)('booking-availability', {
    method: 'POST',
    body: JSON.stringify(p)
  });
}

// Optional if you choose API submission when permitted by DMN

function createBooking(p) {
  return (0,_http__WEBPACK_IMPORTED_MODULE_0__.j)('bookings', {
    method: 'POST',
    body: JSON.stringify(p)
  });
}

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
/* harmony import */ var _state__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./state */ "./src/frontend/app/state.ts");
/* harmony import */ var _api_public__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../api/public */ "./src/frontend/api/public.ts");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__);





// Optional helpers if you add them to ../api/public later:
// import { getPackages, createBooking, getBookingTypes } from '../api/public';

const SIX_MONTHS_MS = 1000 * 60 * 60 * 24 * 30 * 6;
const todayISO = () => new Date().toISOString().slice(0, 10);
const sixMonthsISO = () => new Date(Date.now() + SIX_MONTHS_MS).toISOString().slice(0, 10);

// Fallback time suggestion generator (if API doesn't give suggestions)
function nearestQuarterTimes(baseHHmm, count = 3) {
  const [h, m] = baseHHmm.split(':').map(Number);
  const mins = h * 60 + m;
  const candidates = [15, -15, 30, -30, 45, -45].map(offset => mins + offset).filter(v => v >= 0 && v < 24 * 60);
  const dedup = new Set();
  for (const c of candidates) {
    const hh = String(Math.floor(c / 60)).padStart(2, '0');
    const mm = String(c % 60).padStart(2, '0');
    dedup.add(`${hh}:${mm}`);
    if (dedup.size >= count) break;
  }
  return Array.from(dedup);
}
function getSuggestedTimes(validation) {
  if (!validation || typeof validation !== 'object') return [];
  const v = validation;

  // DMN commonly uses either "time" or "booking_time"
  const tryKey = key => {
    const node = v[key];
    if (node && typeof node === 'object') {
      const sv = node.suggestedValues;
      if (Array.isArray(sv) && sv.every(x => typeof x === 'string')) return sv;
    }
    return [];
  };
  return tryKey('time').length ? tryKey('time') : tryKey('booking_time');
}
function WidgetRoot({
  venueGroup,
  forcedVenueId,
  corpThreshold = 20,
  corpEnquiryUrl,
  returnUrl
}) {
  const [state, dispatch] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useReducer)(_state__WEBPACK_IMPORTED_MODULE_1__.reducer, {
    ..._state__WEBPACK_IMPORTED_MODULE_1__.initialState,
    step: forcedVenueId ? 'stage1' : 'venue',
    venueId: forcedVenueId !== null && forcedVenueId !== void 0 ? forcedVenueId : null
  });

  // ========= Venues (only when not forced) =========
  const [venues, setVenues] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)([]);
  const [vLoading, setVLoading] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
  const [vErr, setVErr] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(null);
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    if (forcedVenueId) return;
    (async () => {
      try {
        setVLoading(true);
        setVErr(null);
        const res = await (0,_api_public__WEBPACK_IMPORTED_MODULE_2__.getVenues)({
          venue_group: venueGroup,
          fields: 'path,name,title'
        });
        setVenues(res.data.payload?.pages || []);
      } catch (e) {
        setVErr(e?.message || 'Failed to load venues');
      } finally {
        setVLoading(false);
      }
    })();
  }, [venueGroup, forcedVenueId]);

  // ========= Booking Types (Experience) =========
  const [types, setTypes] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)([]);
  const [typesLoading, setTypesLoading] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
  async function loadTypes() {
    if (!state.venueId || !state.date || !state.partySize) return;
    try {
      var _ref, _avJson$validation$ty;
      setTypesLoading(true);

      // 1) try WP-configured types first (keeps friendly names if you have them)
      const res = await fetch(`/wp-json/dmn/v1/booking-types?venue_id=${encodeURIComponent(state.venueId)}`);
      const json = await res.json();
      const configured = Array.isArray(json?.data) ? json.data : [];
      if (configured.length > 0) {
        setTypes(configured.map(t => ({
          id: String(t.id),
          name: t.name || String(t.id),
          description: t.description || '',
          priceText: t.priceText || ''
        })));
        return;
      }

      // 2) fallback: ask availability WITHOUT a type to get DMN’s suggestions
      const avRes = await fetch(`/wp-json/dmn/v1/booking-availability`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          venue_id: state.venueId,
          num_people: state.partySize,
          date: state.date
          // no type here on purpose
        })
      });
      const avJson = await avRes.json();

      // Handles both shapes:
      // - suggestedValues: string[]
      // - suggestedValues: { value: { id, name, ... }, valid, ... }[]
      const rawSuggested = (_ref = (_avJson$validation$ty = avJson?.validation?.type?.suggestedValues) !== null && _avJson$validation$ty !== void 0 ? _avJson$validation$ty : avJson?.data?.payload?.validation?.type?.suggestedValues) !== null && _ref !== void 0 ? _ref : [];
      const suggestedTypes = (Array.isArray(rawSuggested) ? rawSuggested : []).map(item => {
        const v = item && typeof item === 'object' && 'value' in item ? item.value : item;
        return v && typeof v === 'object' ? {
          id: String(v.id),
          name: v.name || String(v.id)
        } : typeof v === 'string' ? {
          id: v,
          name: v
        } : null;
      }).filter(Boolean);

      // de-dupe by id and set
      const seen = new Set();
      const finalTypes = suggestedTypes.filter(t => {
        if (seen.has(t.id)) return false;
        seen.add(t.id);
        return true;
      }).map(t => ({
        id: t.id,
        name: t.name,
        description: '',
        // optional: you can enrich later from WP
        priceText: ''
      }));
      setTypes(finalTypes);
    } catch {
      setTypes([]);
    } finally {
      setTypesLoading(false);
    }
  }

  // When we arrive on the "type" step with base inputs ready, fetch types
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    if (state.step === 'type') loadTypes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.step, state.venueId, state.date, state.partySize]);

  // ========= Packages (per venue) =========
  const [pkLoading, setPkLoading] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
  async function loadPackages() {
    if (!state.venueId) return;
    try {
      setPkLoading(true);
      const res = await fetch(`/wp-json/dmn/v1/packages?venue_id=${encodeURIComponent(state.venueId)}`);
      const json = await res.json();
      dispatch({
        type: 'SET_PACKAGES',
        value: json?.data || []
      });
    } catch {
      dispatch({
        type: 'SET_PACKAGES',
        value: []
      });
    } finally {
      setPkLoading(false);
    }
  }
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    if (state.step === 'packages') loadPackages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.step, state.venueId]);

  // ========= Availability =========
  async function runAvailability(opts = {}) {
    if (!state.venueId || !state.partySize || !state.date) {
      dispatch({
        type: 'ERROR',
        message: 'Please choose venue, guests and date first.'
      });
      return;
    }
    if (!state.bookingType) {
      // Type is mandatory at many venues
      dispatch({
        type: 'ERROR',
        message: 'Please choose an experience.'
      });
      return;
    }
    dispatch({
      type: 'ERROR',
      message: null
    });
    const payload = {
      venue_id: state.venueId,
      num_people: state.partySize,
      date: state.date,
      ...(state.bookingType ? {
        type: state.bookingType
      } : {}),
      ...(opts.includeTime && state.time ? {
        time: state.time
      } : {})
      // getOffers?: true // optional if you want offers surfaced here
    };
    const r = await (0,_api_public__WEBPACK_IMPORTED_MODULE_2__.checkAvailability)(payload);
    const valid = !!r?.payload?.valid;
    const action = r?.payload?.action;
    const nextWeb = r?.payload?.next?.web;

    // Extract suggested times from validation if present
    const suggested = getSuggestedTimes(r?.payload?.validation);
    dispatch({
      type: 'SET_AVAIL',
      value: {
        valid,
        action,
        nextWeb: nextWeb || null
      }
    });
    if (!valid && state.time) {
      const fallback = suggested.length ? suggested.slice(0, 3) : nearestQuarterTimes(state.time, 3);
      dispatch({
        type: 'SET_SUGGESTIONS',
        value: fallback
      });
    } else {
      dispatch({
        type: 'SET_SUGGESTIONS',
        value: []
      });
    }
    return {
      valid,
      action,
      nextWeb,
      suggested
    };
  }

  // ========= Corporate threshold guard =========
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    if (state.step === 'stage1' && corpEnquiryUrl && state.partySize > (corpThreshold || 20)) {
      window.location.assign(corpEnquiryUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.partySize, state.step, corpThreshold, corpEnquiryUrl]);

  // Auto-continue when only one type exists
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    if (state.step !== 'type' || !types.length) return;
    if (types.length === 1 && !state.bookingType) {
      dispatch({
        type: 'SET_TYPE',
        value: types[0].id
      });
      (async () => {
        await runAvailability();
        dispatch({
          type: 'NEXT'
        });
      })();
    }
  }, [state.step, types, state.bookingType]); // eslint-disable-line react-hooks/exhaustive-deps

  // ========= Review countdown =========
  const [now, setNow] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(Date.now());
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    if (state.step !== 'review') return;
    const deadline = Date.now() + 10 * 60 * 1000; // 10 min
    dispatch({
      type: 'START_REVIEW_TIMER',
      deadline
    });
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [state.step]);
  const remainingSec = Math.max(0, Math.floor(((state.reviewDeadline || 0) - now) / 1000));
  const mm = String(Math.floor(remainingSec / 60)).padStart(2, '0');
  const ss = String(remainingSec % 60).padStart(2, '0');
  const expired = remainingSec <= 0;

  // ========= Create booking then redirect =========
  async function onConfirm() {
    if (expired) {
      dispatch({
        type: 'ERROR',
        message: 'Your selection expired. Please re-check availability.'
      });
      return;
    }
    if (!state.venueId || !state.partySize || !state.date || !state.time || !state.bookingType) {
      dispatch({
        type: 'ERROR',
        message: 'Missing details. Please complete all steps.'
      });
      return;
    }

    // Build a custom_field_value string for accounting/reporting
    const packageLabels = state.packages.filter(p => state.packagesSelected.includes(p.id)).map(p => p.label).join(', ');

    // Split customer name to DMN fields
    const [first_name, ...rest] = (state.customer.name || '').trim().split(/\s+/);
    const last_name = rest.join(' ');
    try {
      const resp = await fetch('/wp-json/dmn/v1/create-booking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          venue_id: state.venueId,
          type: state.bookingType,
          date: state.date,
          time: state.time,
          num_people: state.partySize,
          customer: {
            first_name,
            last_name,
            email: state.customer.email,
            phone: state.customer.phone
          },
          // DMN supports both `package` and `custom_field_value` fields — use what your account maps
          package: packageLabels,
          custom_field_value: packageLabels,
          return_url: returnUrl // DMN will redirect back with reference/status/etc.
        })
      });
      const json = await resp.json();
      const nextWeb = json?.data?.next?.web || json?.next?.web; // support either shape
      if (nextWeb) {
        window.location.assign(nextWeb);
      } else {
        dispatch({
          type: 'ERROR',
          message: 'Booking created but no redirect URL returned.'
        });
      }
    } catch (e) {
      dispatch({
        type: 'ERROR',
        message: e?.message || 'Failed to create booking.'
      });
    }
  }
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)("div", {
    className: "dmn-widget",
    role: "form",
    "aria-labelledby": "dmn-title",
    children: [state.error && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("p", {
      className: "dmn-widget__error",
      role: "alert",
      children: state.error
    }), state.step === 'venue' && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)("div", {
      className: "dmn-widget__step",
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("h3", {
        className: "dmn-widget__title",
        children: "Choose a venue"
      }), vLoading && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("p", {
        children: "Loading venues\u2026"
      }), vErr && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("p", {
        className: "dmn-widget__error",
        children: vErr
      }), !vLoading && !vErr && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)("div", {
        className: "dmn-widget__field",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("label", {
          className: "dmn-widget__label",
          children: "Venue"
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)("select", {
          className: "dmn-widget__select",
          value: state.venueId || '',
          onChange: e => dispatch({
            type: 'SET_VENUE',
            id: e.target.value || null
          }),
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("option", {
            value: "",
            disabled: true,
            children: "Choose\u2026"
          }), venues.map(v => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("option", {
            value: v._id,
            children: v.name || v.title
          }, v._id))]
        })]
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("div", {
        className: "dmn-widget__actions",
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("button", {
          className: "dmn-widget__btn",
          disabled: !state.venueId,
          onClick: () => dispatch({
            type: 'NEXT'
          }),
          children: "Continue"
        })
      })]
    }), state.step === 'stage1' && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)("div", {
      className: "dmn-widget__step",
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("h3", {
        className: "dmn-widget__title",
        children: "Guests & date"
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)("div", {
        className: "dmn-widget__field",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("label", {
          className: "dmn-widget__label",
          children: "Number of guests"
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("input", {
          className: "dmn-widget__input",
          type: "number",
          min: 1,
          max: 100,
          value: state.partySize,
          onChange: e => {
            const size = Math.max(1, Number(e.target.value || 1));
            dispatch({
              type: 'SET_GUESTS_DATE',
              size,
              date: state.date || todayISO()
            });
          }
        })]
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)("div", {
        className: "dmn-widget__field",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("label", {
          className: "dmn-widget__label",
          children: "Date"
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("input", {
          className: "dmn-widget__input",
          type: "date",
          min: todayISO(),
          max: sixMonthsISO(),
          value: state.date || '',
          onChange: e => dispatch({
            type: 'SET_GUESTS_DATE',
            size: state.partySize,
            date: e.target.value
          })
        })]
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("div", {
        className: "dmn-widget__hint",
        children: "We\u2019ll check availability next."
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)("div", {
        className: "dmn-widget__actions",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("button", {
          className: "dmn-widget__btn dmn-widget__btn--ghost",
          onClick: () => dispatch({
            type: 'BACK'
          }),
          children: "Back"
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("button", {
          className: "dmn-widget__btn",
          disabled: !(state.venueId || forcedVenueId),
          onClick: () => {
            if (!state.date) {
              dispatch({
                type: 'SET_GUESTS_DATE',
                size: state.partySize,
                date: todayISO()
              });
            }
            dispatch({
              type: 'NEXT'
            });
          },
          children: "Continue"
        })]
      })]
    }), state.step === 'type' && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)("div", {
      className: "dmn-widget__step",
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("h3", {
        className: "dmn-widget__title",
        children: "Choose an experience"
      }), typesLoading && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("p", {
        children: "Loading experiences\u2026"
      }), !typesLoading && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)("div", {
        className: "dmn-widget__field",
        children: [types.length === 0 && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("p", {
          children: "No experiences configured."
        }), types.map(t => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)("label", {
          className: "dmn-widget__radio",
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("input", {
            type: "radio",
            name: "bookingType",
            value: t.id,
            checked: state.bookingType === t.id,
            onChange: () => dispatch({
              type: 'SET_TYPE',
              value: t.id
            })
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)("span", {
            className: "dmn-widget__radio-label",
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("strong", {
              children: t.name
            }), t.priceText ? ` — ${t.priceText}` : '', t.description ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)("em", {
              children: [" \u2014 ", t.description]
            }) : '']
          })]
        }, t.id))]
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)("div", {
        className: "dmn-widget__actions",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("button", {
          className: "dmn-widget__btn dmn-widget__btn--ghost",
          onClick: () => dispatch({
            type: 'BACK'
          }),
          children: "Back"
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("button", {
          className: "dmn-widget__btn",
          disabled: !state.bookingType,
          onClick: () => {
            // Validate base inputs (venue + guests + date + type).
            runAvailability();
            dispatch({
              type: 'NEXT'
            });
          },
          children: "Continue"
        })]
      })]
    }), state.step === 'time' && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)("div", {
      className: "dmn-widget__step",
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("h3", {
        className: "dmn-widget__title",
        children: "Choose a time"
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)("div", {
        className: "dmn-widget__field",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("label", {
          className: "dmn-widget__label",
          children: "Time"
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("input", {
          className: "dmn-widget__input",
          type: "time",
          step: 900 // 15 min
          ,
          value: state.time || '',
          onChange: e => dispatch({
            type: 'SET_TIME',
            value: e.target.value
          })
        })]
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)("div", {
        className: "dmn-widget__actions",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("button", {
          className: "dmn-widget__btn dmn-widget__btn--ghost",
          onClick: () => dispatch({
            type: 'BACK'
          }),
          children: "Back"
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("button", {
          className: "dmn-widget__btn",
          onClick: async () => {
            const r = await runAvailability({
              includeTime: true
            });
            if (r?.valid) dispatch({
              type: 'NEXT'
            });
          },
          children: "Check availability"
        })]
      }), !!state.suggestions.length && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)("div", {
        className: "dmn-widget__hint",
        children: ["Not available then. Try:", /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("div", {
          className: "dmn-widget__chips",
          children: state.suggestions.map(s => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("button", {
            className: "dmn-widget__chip",
            onClick: async () => {
              dispatch({
                type: 'SET_TIME',
                value: s
              });
              const r = await runAvailability({
                includeTime: true
              });
              if (r?.valid) dispatch({
                type: 'NEXT'
              });
            },
            children: s
          }, s))
        })]
      })]
    }), state.step === 'packages' && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)("div", {
      className: "dmn-widget__step",
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("h3", {
        className: "dmn-widget__title",
        children: "Add-on packages"
      }), pkLoading && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("p", {
        children: "Loading packages\u2026"
      }), !pkLoading && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("ul", {
        className: "dmn-widget__list",
        children: state.packages.map(p => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("li", {
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)("label", {
            className: "dmn-widget__checkbox",
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("input", {
              type: "checkbox",
              checked: state.packagesSelected.includes(p.id),
              onChange: e => {
                const next = new Set(state.packagesSelected);
                e.target.checked ? next.add(p.id) : next.delete(p.id);
                dispatch({
                  type: 'SET_PACKAGES_SELECTED',
                  value: Array.from(next)
                });
              }
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("span", {
              children: p.label
            })]
          })
        }, p.id))
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)("div", {
        className: "dmn-widget__actions",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("button", {
          className: "dmn-widget__btn dmn-widget__btn--ghost",
          onClick: () => dispatch({
            type: 'BACK'
          }),
          children: "Back"
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("button", {
          className: "dmn-widget__btn",
          onClick: () => dispatch({
            type: 'NEXT'
          }),
          children: "Continue"
        })]
      })]
    }), state.step === 'details' && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)("div", {
      className: "dmn-widget__step",
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("h3", {
        className: "dmn-widget__title",
        children: "Your details"
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)("div", {
        className: "dmn-widget__field",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("label", {
          className: "dmn-widget__label",
          children: "Name"
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("input", {
          className: "dmn-widget__input",
          value: state.customer.name,
          onChange: e => dispatch({
            type: 'SET_CUSTOMER',
            value: {
              ...state.customer,
              name: e.target.value
            }
          })
        })]
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)("div", {
        className: "dmn-widget__field",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("label", {
          className: "dmn-widget__label",
          children: "Email"
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("input", {
          className: "dmn-widget__input",
          type: "email",
          value: state.customer.email,
          onChange: e => dispatch({
            type: 'SET_CUSTOMER',
            value: {
              ...state.customer,
              email: e.target.value
            }
          })
        })]
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)("div", {
        className: "dmn-widget__field",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("label", {
          className: "dmn-widget__label",
          children: "Phone (optional)"
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("input", {
          className: "dmn-widget__input",
          value: state.customer.phone || '',
          onChange: e => dispatch({
            type: 'SET_CUSTOMER',
            value: {
              ...state.customer,
              phone: e.target.value
            }
          })
        })]
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)("div", {
        className: "dmn-widget__field",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("label", {
          className: "dmn-widget__label",
          children: "Message (optional)"
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("textarea", {
          className: "dmn-widget__textarea",
          value: state.customer.message || '',
          onChange: e => dispatch({
            type: 'SET_CUSTOMER',
            value: {
              ...state.customer,
              message: e.target.value
            }
          })
        })]
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)("label", {
        className: "dmn-widget__checkbox",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("input", {
          type: "checkbox",
          checked: !!state.customer.gdpr,
          onChange: e => dispatch({
            type: 'SET_CUSTOMER',
            value: {
              ...state.customer,
              gdpr: e.target.checked
            }
          })
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("span", {
          children: "I agree to be contacted (GDPR)."
        })]
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)("div", {
        className: "dmn-widget__actions",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("button", {
          className: "dmn-widget__btn dmn-widget__btn--ghost",
          onClick: () => dispatch({
            type: 'BACK'
          }),
          children: "Back"
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("button", {
          className: "dmn-widget__btn",
          onClick: () => dispatch({
            type: 'NEXT'
          }),
          children: "Review"
        })]
      })]
    }), state.step === 'review' && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)("div", {
      className: "dmn-widget__step",
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("h3", {
        className: "dmn-widget__title",
        children: "Review & confirm"
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)("ul", {
        className: "dmn-widget__summary",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)("li", {
          children: ["Venue: ", /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("code", {
            children: state.venueId
          })]
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)("li", {
          children: ["Guests: ", state.partySize]
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)("li", {
          children: ["Date: ", state.date]
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)("li", {
          children: ["Time: ", state.time]
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)("li", {
          children: ["Experience: ", state.bookingType]
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)("li", {
          children: ["Packages:", ' ', state.packages.filter(p => state.packagesSelected.includes(p.id)).map(p => p.label).join(', ') || 'None']
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)("li", {
          children: ["Name/Email: ", state.customer.name, " / ", state.customer.email]
        })]
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("div", {
        className: "dmn-widget__promo",
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)("div", {
          className: "dmn-widget__promo-item",
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("img", {
            src: "/path/to/promo1.jpg",
            alt: ""
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)("div", {
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("strong", {
              children: "Summer specials"
            }), " \u2014 Save 10% on midweek bookings"]
          })]
        })
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)("details", {
        className: "dmn-widget__faq",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("summary", {
          children: "Can I change my booking later?"
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("p", {
          children: "Contact the venue via your confirmation email."
        })]
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)("details", {
        className: "dmn-widget__faq",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("summary", {
          children: "What if I\u2019m running late?"
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("p", {
          children: "Please let the venue know; policies vary."
        })]
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)("p", {
        className: `dmn-widget__countdown${expired ? ' is-expired' : ''}`,
        children: ["Hold expires in", ' ', /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)("strong", {
          children: [mm, ":", ss]
        })]
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)("div", {
        className: "dmn-widget__actions",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("button", {
          className: "dmn-widget__btn dmn-widget__btn--ghost",
          onClick: () => dispatch({
            type: 'BACK'
          }),
          children: "Back"
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("button", {
          className: "dmn-widget__btn",
          onClick: onConfirm,
          disabled: expired,
          children: "Continue to payment"
        })]
      })]
    })]
  });
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
const FLOW_ORDER = ['venue', 'stage1', 'type', 'time', 'packages', 'details', 'review'];

// ---- Defaults ----
// NOTE: Widget sets the first step dynamically:
// - forcedVenueId ? 'stage1' : 'venue'
const initialState = {
  step: 'stage1',
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
    case 'SET_GUESTS_DATE':
      {
        const dateChanged = a.date !== s.date;
        return {
          ...s,
          partySize: Math.max(1, a.size),
          date: a.date,
          // Reset time/availability if the date changed
          time: dateChanged ? null : s.time,
          avail: dateChanged ? null : s.avail,
          suggestions: []
        };
      }
    case 'SET_TYPE':
      return {
        ...s,
        bookingType: a.value,
        // Changing type invalidates previous time/availability
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