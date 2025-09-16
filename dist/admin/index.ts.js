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

/***/ "./src/admin/api.ts":
/*!**************************!*\
  !*** ./src/admin/api.ts ***!
  \**************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   adminListActivities: () => (/* binding */ adminListActivities),
/* harmony export */   adminListVenues: () => (/* binding */ adminListVenues),
/* harmony export */   adminSaveActivity: () => (/* binding */ adminSaveActivity),
/* harmony export */   adminSyncAll: () => (/* binding */ adminSyncAll),
/* harmony export */   adminSyncTypesAll: () => (/* binding */ adminSyncTypesAll),
/* harmony export */   adminSyncVenues: () => (/* binding */ adminSyncVenues),
/* harmony export */   getSettings: () => (/* binding */ getSettings),
/* harmony export */   saveSettings: () => (/* binding */ saveSettings),
/* harmony export */   testConnection: () => (/* binding */ testConnection)
/* harmony export */ });
const {
  restUrl,
  nonce
} = window.DMN_ADMIN_BOOT;
/**
 * Performs a fetch request to the WordPress REST API using the provided path and options.
 *
 * @param path - The API endpoint path to request.
 * @param opts - Optional fetch options including method and body.
 * @returns A promise resolving to the parsed JSON response.
 * @throws If the response is not OK, throws an error with the response message or HTTP status.
 */
async function wpFetch(path, opts = {}) {
  const {
    restUrl,
    nonce
  } = window.DMN_ADMIN_BOOT;
  const base = restUrl.endsWith('/') ? restUrl : restUrl + '/';
  const url = path.startsWith('http') ? path : base + path.replace(/^\//, ''); // strip any leading slash on path
  const r = await fetch(url, {
    method: opts.method || 'GET',
    headers: {
      'X-WP-Nonce': nonce,
      'Content-Type': 'application/json'
    },
    body: opts.body ? JSON.stringify(opts.body) : undefined
  });
  const json = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(json?.message || `HTTP ${r.status}`);
  return await json;
}

/**
 * Performs a fetch request to the backend REST API and parses the JSON response.
 *
 * @template T - The expected response type.
 * @param path - The API endpoint path to request.
 * @param init - Optional fetch initialization options.
 * @returns A promise resolving to the parsed JSON response of type T.
 * @throws If the response is not OK, throws an error with the HTTP status.
 */
async function json(path, init) {
  const res = await fetch(restUrl + path, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      'X-WP-Nonce': nonce,
      ...(init?.headers || {})
    },
    credentials: 'same-origin'
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

/**
 * Retrieves the current plugin settings from the backend.
 *
 * @returns A promise resolving to an object containing:
 *   app_id, api_key_mask, environment, venue_group, debug_mode, and has_key.
 */
function getSettings() {
  return json('settings');
}

/**
 * Saves the provided settings to the backend via a POST request.
 *
 * @param payload - An object containing optional settings fields to update:
 *   app_id, api_key, environment, venue_group, debug_mode.
 * @returns A promise resolving to the updated settings response from the backend.
 */
function saveSettings(payload) {
  return json('settings', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

/**
 * Tests the API connection to the backend.
 * Optionally enables debug mode to receive additional debug information.
 *
 * @param debug - If true, includes debug information in the response.
 * @returns A promise resolving to the connection test result and optional debug details.
 */
function testConnection(debug = false) {
  const path = debug ? 'test?debug=1' : 'test';
  return json(path);
}

/**
 * Represents a venue in the admin API.
 *
 * @property id - The unique identifier for the venue.
 * @property title - The display name of the venue.
 * @property dmn_id - The DMN system identifier for the venue.
 */

/**
 * Represents an activity associated with a venue in the admin API.
 *
 * @property id - The unique identifier for the activity.
 * @property dmn_type_id - The DMN system type identifier for the activity.
 * @property name - The name of the activity.
 * @property description - Optional description of the activity.
 * @property priceText - Optional price information as text.
 * @property image_id - Optional image identifier.
 * @property image_url - Optional image URL.
 * @property gallery_ids - Optional array of gallery image IDs.
 */

/**
 * Retrieves the list of venues from the admin API.
 *
 * @returns A promise resolving to an object containing an array of venues.
 */
async function adminListVenues() {
  return wpFetch('venues');
}

/**
 * Synchronizes venues with the backend and returns the count of updated venues.
 *
 * @returns A promise resolving to an object with ok status and count of venues.
 */
async function adminSyncVenues() {
  return wpFetch('sync/venues', {
    method: 'POST'
  });
}

/**
 * Synchronizes all activity types with the backend and returns the count of updated types.
 *
 * @returns A promise resolving to an object with ok status and count of types.
 */
async function adminSyncTypesAll() {
  return wpFetch('sync/types', {
    method: 'POST'
  });
}

/**
 * Retrieves the list of activities for a specific venue from the admin API.
 *
 * @param venuePostId - The unique identifier of the venue.
 * @returns A promise resolving to an object containing an array of activities.
 */
async function adminListActivities(venuePostId) {
  return wpFetch(`venues/${venuePostId}/activities`);
}

/**
 * Saves updates to a specific activity in the admin API.
 *
 * @param activityPostId - The unique identifier of the activity.
 * @param patch - Partial activity data to update.
 * @returns A promise resolving to an object with ok status.
 */
async function adminSaveActivity(activityPostId, patch) {
  return wpFetch(`activities/${activityPostId}`, {
    method: 'POST',
    body: patch
  });
}

/**
 * Synchronizes all venues and activity types with the backend.
 *
 * @returns A promise resolving to an object containing:
 *   ok status, number of venues and types synchronized, duration in milliseconds, and a message.
 */
async function adminSyncAll() {
  return wpFetch('sync/all', {
    method: 'POST'
  });
}

/***/ }),

/***/ "./src/admin/components/ActivityManagerCard.tsx":
/*!******************************************************!*\
  !*** ./src/admin/components/ActivityManagerCard.tsx ***!
  \******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ ActivityManagerCard)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _api__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../api */ "./src/admin/api.ts");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__);
// src/admin/components/ActivityManagerCard.tsx



// WP media global

function ActivityManagerCard() {
  const [venues, setVenues] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)([]);
  const [selected, setSelected] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)('');
  const [loading, setLoading] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
  const [rows, setRows] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)([]);
  const [orig, setOrig] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)([]);
  const [err, setErr] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(null);
  const [ok, setOk] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(null);
  const [saving, setSaving] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
  const MAX = 200;
  // Track which rows have changes
  const dirty = (0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => {
    const d = new Set();
    const byId = new Map(orig.map(r => [r.id, r]));
    for (const r of rows) {
      const o = byId.get(r.id);
      if (!o) {
        d.add(r.id);
        continue;
      }
      if (r.name !== o.name || (r.description || '') !== (o.description || '') || (r.priceText || '') !== (o.priceText || '') || (r.image_id || null) !== (o.image_id || null)) {
        d.add(r.id);
      }
    }
    return d;
  }, [rows, orig]);
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    (async () => {
      try {
        const r = await (0,_api__WEBPACK_IMPORTED_MODULE_1__.adminListVenues)();
        setVenues(r.venues);
      } catch (e) {
        setErr(e.message || 'Failed to load venues.');
      }
    })();
  }, []);
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    if (!selected) {
      setRows([]);
      setOrig([]);
      return;
    }
    (async () => {
      setLoading(true);
      setErr(null);
      setOk(null);
      try {
        const r = await (0,_api__WEBPACK_IMPORTED_MODULE_1__.adminListActivities)(Number(selected));
        setRows(r.activities);
        setOrig(r.activities);
      } catch (e) {
        setErr(e.message || 'Failed to load activities.');
      } finally {
        setLoading(false);
      }
    })();
  }, [selected]);
  const onCell = (id, key, value) => setRows(rs => rs.map(r => r.id === id ? {
    ...r,
    [key]: value
  } : r));
  const openMedia = id => {
    // Ensure wp.media is availabel (enqueue_media in PHP)
    if (!wp?.media) {
      setErr('WordPress media library not available.');
      return;
    }
    const frame = wp.media({
      title: 'Select image',
      button: {
        text: 'Use this image'
      },
      multiple: false,
      library: {
        type: 'image'
      }
    });
    frame.on('select', () => {
      const attachment = frame.state().get('selection').first().toJSON();
      onCell(id, 'image_id', attachment.id);
      onCell(id, 'image_url', attachment.sizes?.medium?.url || attachment.url);
    });
    frame.open();
  };
  const clearImage = id => {
    onCell(id, 'image_id', null);
    onCell(id, 'image_url', null);
  };
  const saveAll = async () => {
    setSaving(true);
    setErr(null);
    setOk(null);
    try {
      // Only save changed rows
      const changed = rows.filter(r => dirty.has(r.id));
      if (changed.length === 0) {
        setOk('Nothing to save.');
        return;
      }
      const results = await Promise.allSettled(changed.map(r => {
        var _r$description, _r$priceText, _r$image_id;
        return (0,_api__WEBPACK_IMPORTED_MODULE_1__.adminSaveActivity)(r.id, {
          name: r.name,
          description: (_r$description = r.description) !== null && _r$description !== void 0 ? _r$description : '',
          priceText: (_r$priceText = r.priceText) !== null && _r$priceText !== void 0 ? _r$priceText : '',
          image_id: (_r$image_id = r.image_id) !== null && _r$image_id !== void 0 ? _r$image_id : null
        });
      }));
      const failed = results.filter(x => x.status === 'rejected');
      if (failed.length) {
        setErr(`Saved ${changed.length - failed.length}/${changed.length}. Last error: ${failed[0].reason?.message || 'Unknown error'}`);
      } else {
        setOk(`Saved ${changed.length} activities.`);
        // Refresh from server so image_url reflects generated sizes/changes
        const r = await (0,_api__WEBPACK_IMPORTED_MODULE_1__.adminListActivities)(Number(selected));
        setRows(r.activities);
        setOrig(r.activities);
      }
    } catch (e) {
      setErr(e.message || 'Save failed.');
    } finally {
      setSaving(false);
    }
  };
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsxs)("section", {
    className: "dmn-admin__card",
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsxs)("div", {
      className: "dmn-admin__header",
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)("h2", {
        className: "dmn-admin__header__headline",
        children: "Activity Manager"
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsxs)("span", {
        className: "dmn-admin__header__inner",
        children: [dirty.size > 0 && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsxs)("p", {
          className: "dmn-admin__header__dirty",
          children: ["You have unsaved changes (", dirty.size, " ", dirty.size === 1 ? 'activity' : 'activities', ")."]
        }), ok && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)("p", {
          className: "dmn-admin__header__ok",
          children: ok
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)("button", {
          className: "button",
          onClick: saveAll,
          disabled: saving || dirty.size === 0,
          children: saving ? 'Saving…' : 'Save all changes'
        })]
      })]
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsxs)("label", {
      style: {
        display: 'block',
        marginBottom: 30
      },
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)("span", {
        children: "Select venue"
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsxs)("select", {
        value: selected,
        onChange: e => setSelected(e.target.value ? Number(e.target.value) : ''),
        style: {
          display: 'block',
          marginTop: 7.5
        },
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)("option", {
          value: "",
          children: "\u2014 Choose a venue \u2014"
        }), venues.map(v => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsxs)("option", {
          value: v.id,
          children: [v.title, " ", v.dmn_id ? `(DMN ${v.dmn_id})` : '']
        }, v.id))]
      })]
    }), loading && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)("p", {
      children: "Loading activities\u2026"
    }), err && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)("p", {
      className: "err",
      children: err
    }), !loading && selected && rows.length === 0 && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)("p", {
      children: "No activities imported for this venue yet."
    }), !loading && rows.length > 0 && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.Fragment, {
      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)("div", {
        className: "table",
        children: rows.map(r => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)((react__WEBPACK_IMPORTED_MODULE_0___default().Fragment), {
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsxs)("div", {
            className: "table__row",
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsxs)("div", {
              className: "table__left",
              children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsxs)("div", {
                className: "table__cell",
                children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)("div", {
                  className: "table__label",
                  children: "Name"
                }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)("input", {
                  value: r.name,
                  onChange: e => onCell(r.id, 'name', e.target.value)
                })]
              }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsxs)("div", {
                className: "table__cell",
                children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)("div", {
                  className: "table__label",
                  children: "Description - (Max 200)"
                }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)("textarea", {
                  rows: 2,
                  maxLength: MAX,
                  value: r.description || '',
                  onChange: e => onCell(r.id, 'description', e.target.value)
                })]
              }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsxs)("div", {
                className: "table__cell",
                children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)("div", {
                  className: "table__label",
                  children: "Price"
                }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)("input", {
                  value: r.priceText || '',
                  onChange: e => onCell(r.id, 'priceText', e.target.value)
                })]
              })]
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)("div", {
              className: "table__right",
              children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsxs)("div", {
                className: "table__image-picker",
                children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)("div", {
                  className: "table__label",
                  children: "Image"
                }), r.image_url ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)("img", {
                  src: r.image_url,
                  alt: "",
                  className: "table__image-picker__image"
                }) : /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)("div", {
                  className: "table__image-picker__image-preview"
                }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsxs)("div", {
                  className: "table__image-picker__button-wrap",
                  children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)("button", {
                    className: "table__image-picker__btn button",
                    type: "button",
                    onClick: () => openMedia(r.id),
                    children: "Choose image"
                  }), r.image_id ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)("button", {
                    className: "table__image-picker__btn  button button--remove",
                    type: "button",
                    onClick: () => clearImage(r.id),
                    children: "Remove"
                  }) : null]
                })]
              })
            })]
          })
        }, r.id))
      })
    })]
  });
}

/***/ }),

/***/ "./src/admin/components/DataSyncCard.tsx":
/*!***********************************************!*\
  !*** ./src/admin/components/DataSyncCard.tsx ***!
  \***********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ DataSyncCard)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _api__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../api */ "./src/admin/api.ts");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__);
// src/admin/components/DataSyncCard.tsx



function DataSyncCard() {
  const [busy, setBusy] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
  const [ok, setOk] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(null);
  const [err, setErr] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(null);
  const run = async () => {
    setBusy(true);
    setOk(null);
    setErr(null);
    try {
      const r = await (0,_api__WEBPACK_IMPORTED_MODULE_1__.adminSyncAll)();
      setOk(r.message || `Imported ${r.venues_count} venues and ${r.types_count} activity types.`);
    } catch (e) {
      setErr(e.message || 'Sync failed.');
    } finally {
      setBusy(false);
    }
  };
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsxs)("section", {
    className: "dmn-admin__card",
    style: {
      marginTop: 16
    },
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)("h2", {
      children: "Data Sync"
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)("p", {
      children: "Import / update venues and activity types from DesignMyNight into WordPress."
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)("div", {
      className: "actions",
      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)("button", {
        className: "button button--action",
        onClick: run,
        disabled: busy,
        children: busy ? 'Importing…' : 'Import data'
      })
    }), ok && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)("p", {
      className: "ok",
      style: {
        marginTop: 8
      },
      children: ok
    }), err && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)("p", {
      className: "err",
      style: {
        marginTop: 8
      },
      children: err
    })]
  });
}

/***/ }),

/***/ "./src/admin/components/SettingsCard.tsx":
/*!***********************************************!*\
  !*** ./src/admin/components/SettingsCard.tsx ***!
  \***********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ SettingsCard)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _api__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../api */ "./src/admin/api.ts");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__);
// src/admin/components/SettingsCard.tsx



function SettingsCard() {
  const [loading, setLoading] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(true);
  const [saving, setSaving] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
  const [testing, setTesting] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
  const [err, setErr] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(null);
  const [ok, setOk] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(null);
  const [details, setDetails] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(null);
  const [form, setForm] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)({
    app_id: '',
    api_key: '',
    environment: 'prod',
    venue_group: '',
    debug_mode: false
  });
  const [mask, setMask] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)('');
  const load = async () => {
    setLoading(true);
    setErr(null);
    try {
      const s = await (0,_api__WEBPACK_IMPORTED_MODULE_1__.getSettings)();
      setForm({
        app_id: s.app_id || '',
        api_key: '',
        environment: s.environment,
        venue_group: s.venue_group || '',
        debug_mode: !!s.debug_mode
      });
      setMask(s.api_key_mask || '');
    } catch (e) {
      setErr(e.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  };
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    load();
  }, []);
  const onSave = async e => {
    e.preventDefault();
    setSaving(true);
    setErr(null);
    setOk(null);
    try {
      const payload = {
        app_id: form.app_id.trim(),
        api_key: form.api_key.trim(),
        // blank => keep existing on server
        environment: form.environment,
        venue_group: form.venue_group.trim(),
        debug_mode: form.debug_mode
      };
      await (0,_api__WEBPACK_IMPORTED_MODULE_1__.saveSettings)(payload);
      setOk('Settings saved.');
      if (form.api_key) await load(); // refresh mask if key changed
      setForm(f => ({
        ...f,
        api_key: ''
      })); // clear write-only field
    } catch (e) {
      setErr(e.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };
  const onTest = async () => {
    setTesting(true);
    setErr(null);
    setOk(null);
    setDetails(null);
    try {
      const r = await (0,_api__WEBPACK_IMPORTED_MODULE_1__.testConnection)(form.debug_mode);
      if (r.debug) setDetails(r.debug);
      if (r.ok) setOk(`Test OK. Status ${r.status}.`);else setErr(`Test failed (${r.status}). ${r.error || ''}`);
    } catch (e) {
      setErr(e.message || 'Test failed');
    } finally {
      setTesting(false);
    }
  };
  if (loading) return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)("p", {
    children: "Loading\u2026"
  });
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsxs)("section", {
    className: "dmn-admin__card",
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)("h2", {
      children: "API Credentials"
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsxs)("form", {
      onSubmit: onSave,
      className: "grid",
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsxs)("label", {
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)("span", {
          children: "App ID"
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)("input", {
          value: form.app_id,
          onChange: e => setForm({
            ...form,
            app_id: e.target.value
          }),
          required: true
        })]
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsxs)("label", {
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)("span", {
          children: "API Key"
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)("input", {
          value: form.api_key,
          autoComplete: "new-password",
          placeholder: mask ? `${mask}` : 'your_api_key',
          onChange: e => setForm({
            ...form,
            api_key: e.target.value
          })
        })]
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsxs)("label", {
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)("span", {
          children: "Environment"
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsxs)("select", {
          value: form.environment,
          onChange: e => setForm({
            ...form,
            environment: e.target.value
          }),
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)("option", {
            value: "prod",
            children: "Production"
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)("option", {
            value: "qa",
            children: "QA / Sandbox"
          })]
        })]
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsxs)("label", {
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)("span", {
          children: "Default Venue Group (optional)"
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)("input", {
          value: form.venue_group,
          onChange: e => setForm({
            ...form,
            venue_group: e.target.value
          })
        })]
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsxs)("label", {
        style: {
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8
        },
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)("input", {
          type: "checkbox",
          checked: form.debug_mode,
          onChange: e => setForm({
            ...form,
            debug_mode: e.target.checked
          })
        }), "Debug mode (saved with settings)"]
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsxs)("div", {
        className: "actions",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)("button", {
          className: "button button--action",
          type: "submit",
          disabled: saving,
          children: saving ? 'Saving…' : 'Save Settings'
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)("button", {
          className: "button button--sub",
          type: "button",
          onClick: onTest,
          disabled: testing,
          children: testing ? 'Testing…' : 'Test Connection'
        })]
      })]
    }), ok && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)("p", {
      className: "ok",
      children: ok
    }), err && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)("p", {
      className: "err",
      children: err
    }), details && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)("pre", {
      className: "debug-dump",
      style: {
        background: '#f6f7f7',
        padding: 12,
        borderRadius: 6,
        overflow: 'auto',
        maxHeight: 320,
        marginTop: 8
      },
      children: JSON.stringify(details, null, 2)
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)("p", {
      style: {
        opacity: 0.7,
        marginTop: 8
      },
      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsxs)("small", {
        children: ["Note: Test Connection uses the last ", /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)("em", {
          children: "saved"
        }), " credentials & environment. Click", ' ', /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)("strong", {
          children: "Save Settings"
        }), " after any changes."]
      })
    })]
  });
}

/***/ }),

/***/ "./src/admin/index.tsx":
/*!*****************************!*\
  !*** ./src/admin/index.tsx ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react_dom_client__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react-dom/client */ "./node_modules/react-dom/client.js");
/* harmony import */ var _components_SettingsCard__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./components/SettingsCard */ "./src/admin/components/SettingsCard.tsx");
/* harmony import */ var _components_DataSyncCard__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./components/DataSyncCard */ "./src/admin/components/DataSyncCard.tsx");
/* harmony import */ var _components_ActivityManagerCard__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./components/ActivityManagerCard */ "./src/admin/components/ActivityManagerCard.tsx");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__);
// src/admin/index.tsx






function App() {
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("div", {
    className: "dmn-admin",
    children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)("div", {
      className: "dmn-admin__grid",
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("div", {
        className: "dmn-admin__main",
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_components_ActivityManagerCard__WEBPACK_IMPORTED_MODULE_4__["default"], {})
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)("div", {
        className: "dmn-admin__side",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_components_SettingsCard__WEBPACK_IMPORTED_MODULE_2__["default"], {}), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_components_DataSyncCard__WEBPACK_IMPORTED_MODULE_3__["default"], {})]
      })]
    })
  });
}
(0,react_dom_client__WEBPACK_IMPORTED_MODULE_1__.createRoot)(document.getElementById('dmn-admin-root')).render(/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(App, {}));

/***/ }),

/***/ "./src/admin/styles/styles.scss":
/*!**************************************!*\
  !*** ./src/admin/styles/styles.scss ***!
  \**************************************/
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
/*!****************************!*\
  !*** ./src/admin/index.ts ***!
  \****************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _styles_styles_scss__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./styles/styles.scss */ "./src/admin/styles/styles.scss");
/* harmony import */ var _index_tsx__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./index.tsx */ "./src/admin/index.tsx");


})();

/******/ })()
;
//# sourceMappingURL=index.ts.js.map