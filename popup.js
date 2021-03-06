console.log("Powerup: popup.js loaded.");
window.jQuery || console.log("Powerup: No jQuery for popup.js...");
$(document).ready(function () {
    let config_p = loadConfig();
    updateDebugOutput(config_p);

    $.when(config_p).done(function (config) {
        updateControls(config);
        $('#save').on('click', saveAndClose);
    });

});

function saveAndClose() {
    let p = writeConfig();
    $.when(p).done(function () {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, { Powerup: "UpdateConfig" }, () => {
                window.close();
            });
        });
    });
}

function loadConfig() {
    let p = $.Deferred();
    let defaultConfig = {
        Powerups: {
            tooltipPU: true,
            colorPU: true,
            svgPU: true,
            worldmapPU: true,
            bannerPU: true,
            usqlstackPU: true,
            usqlcolorPU: true,
            linePU: true,
            heatmapPU: true,
            sankeyPU: true,
            funnelPU: true,
            mathPU: true,
            datePU: true,
            gaugePU: true,
            comparePU: true,
            debug: false,
            colorPUTarget: "Text",
            animateCritical: "3 Pulses",
            animateWarning: "Never",
            sunburnMode: false,
            libLocation: "ext"
        }
    };

    chrome.storage.local.get(['Powerups'], function (result) {
        console.log('Powerup: (popup) config from storage is: ' + JSON.stringify(result));
        if (result && result.Powerups
            && Object.keys(defaultConfig.Powerups).length === Object.keys(result.Powerups).length
            && result.Powerups.ackedVersion === chrome.runtime.getManifest().version
        ) {
            p.resolve(result);
        }
        else {
            console.log("Powerup: (popup) stored config format didn't match, defaulting...");
            if (typeof (result) == "object" && typeof (result.Powerups) == "object") {
                for (const [key, value] of Object.entries(result.Powerups)) { //merge existing preferences
                    if (typeof (defaultConfig[key]) != "undefined")
                        defaultConfig[key] = value;
                }
            }
            defaultConfig.ackedVersion = chrome.runtime.getManifest().version;
            writeConfig(defaultConfig);
            updateIcon();
            p.resolve(defaultConfig);
        }
    });
    return p;
}

function writeConfig() {
    let p = $.Deferred();
    let config = {
        Powerups: {
            tooltipPU: $('#tooltipPU').prop("checked"),
            colorPU: $('#colorPU').prop("checked"),
            svgPU: $('#svgPU').prop("checked"),
            worldmapPU: $('#worldmapPU').prop("checked"),
            bannerPU: $('#bannerPU').prop("checked"),
            usqlstackPU: $('#usqlstackPU').prop("checked"),
            usqlcolorPU: $('#usqlcolorPU').prop("checked"),
            linePU: $('#linePU').prop("checked"),
            heatmapPU: $('#heatmapPU').prop("checked"),
            sankeyPU: $('#sankeyPU').prop("checked"),
            funnelPU: $('#funnelPU').prop("checked"),
            mathPU: $('#mathPU').prop("checked"),
            datePU: $('#datePU').prop("checked"),
            gaugePU: $('#gaugePU').prop("checked"),
            comparePU: $('#comparePU').prop("checked"),
            debug: $('#debug').prop("checked"),
            colorPUTarget: $('#colorPUTarget').val(),
            animateCritical: $('#animateCritical').val(),
            animateWarning: $('#animateWarning').val(),
            sunburnMode: $('#sunburnMode').prop("checked"),
            libLocation: $('#libLocation').val(),
            ackedVersion: chrome.runtime.getManifest().version
        }
    }

    chrome.storage.local.set(config, function () {
        p.resolve(true);
        console.log('Powerup: (popup) config storage set to ' + JSON.stringify(config));
        updateDebugOutput(loadConfig());
    });
    return p;
}

function updateDebugOutput(config_p) {
    $.when(config_p).done(function (config) {
        $('#notice').val(JSON.stringify(config));
    })
}

function updateControls(config) {
    let powerups = config.Powerups || {};
    Object.keys(config.Powerups).forEach((key) => {
        let selector = '#' + key;
        let val = powerups[key];
        if (typeof (val) == "boolean")
            $(selector).prop("checked", val);
        else
            $(selector).val(val);
    })
}

function updateIcon() {
    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
        chrome.pageAction.setIcon({ tabId: tab.id, path: 'Assets/powerup.png' });
    });
}