/**
 * Represents the zip code from which the package will be sent.
 * @type {string|null}
 */
var getFromZip = null;

/**
 * Represents the zip code to which the package will be delivered.
 * @type {string|null}
 */
var getToZip = null;

/**
 * Represents the count of selected regions.
 * @type {number}
 */
var selectedRegionsCount = 0;

/**
 * Defines the colors associated with each zone.
 * @type {Object<string, string>}
 */
const zoneColors = {
  1: "#9CA5D7",
  2: "#A7C6EE",
  3: "#BDEBF7",
  4: "#BDE7BF",
  5: "#C1E99E",
  6: "#DEF29B",
  7: "#FEFB9F",
  8: "#EFC798",
  // 9: "brown",
};

/**
 * Retrieves the "from" zip value from the input and performs operations based on its validity.
 */
function getValueFrom() {
  var fromZipValue = document.getElementById("fromZip").value;

  // Reset the map when the user starts typing in the 'from' input field
  if (fromZipValue.length === 1 && selectedRegionsCount > 0) {
    resetMapColors();
  }

  if (/^\d{5}$/.test(fromZipValue)) {
    getFromZip = fromZipValue;
    fetchFromZipData();
    checkZone();
    colorZip(getFromZip.slice(0, 3), "grey");
  }
}

/**
 * Retrieves the "to" zip value from the input and performs operations based on its validity.
 */
function getValueTo() {
  var toZipValue = document.getElementById("toZip").value;

  // Reset the map when the user starts typing in the 'to' input field
  if (toZipValue.length === 1 && selectedRegionsCount > 0) {
    resetMapColors();
  }

  if (/^\d{5}$/.test(toZipValue)) {
    getToZip = toZipValue;
    fetchFromZipData();
    fetchToZipData();
    checkZone();
    colorZip(getToZip.slice(0, 3), "grey");
  } else {
    document.getElementById("zoneInfoWrap").style.display = "none";
  }
}

/**
 * Sends an AJAX request to fetch data based on the 'from' zip code.
 */
function fetchFromZipData() {
  showLoading();

  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
    if (this.readyState === 4 && this.status === 200) {
      hideLoading();
      getFrom(this);
    }
  };
  xhttp.open(
    "GET",
    'https://secure.shippingapis.com/ShippingAPI.dll?API=CityStateLookup&XML=<CityStateLookupRequest USERID="364SIMPL0013"><ZipCode ID="1"><Zip5>' +
      getFromZip +
      "</Zip5></ZipCode></CityStateLookupRequest>",
    true
  );
  xhttp.send();
}

/**
 * Processes the XML response for the 'from' zip code and updates the DOM.
 * @param {XMLDocument} xml - The XML document returned from the AJAX request.
 */
function getFrom(xml) {
  var xmlDoc = xml.responseXML;
  var city = xmlDoc.getElementsByTagName("City")[0];
  var state = xmlDoc.getElementsByTagName("State")[0];
  var description = xmlDoc.getElementsByTagName("Description")[0];

  /** Check if the description is present. If not, update DOM with city and state info. */
  if (description === undefined || description.length === 0) {
    city =
      city.textContent.charAt(0).toUpperCase() +
      city.textContent.substr(1).toLowerCase();
    state = state.textContent;
    document.getElementById("fromCS").innerHTML = city + ", " + state + " to ";
  } else {
    /** If a description is present (typically an error), show an alert with the description. */
    description = description.textContent;
    document.getElementById("toast-message").innerHTML = description;
    document.getElementById("alert-wrap").style.display = "block";
    setTimeout(function () {
      document.getElementById("alert-wrap").style.display = "none";
    }, 3000);
  }
}

/**
 * Sends an AJAX request to fetch data based on the 'to' zip code.
 */
function fetchToZipData() {
  showLoading();

  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
    if (this.readyState === 4 && this.status === 200) {
      hideLoading();
      getTo(this);
    }
  };
  xhttp.open(
    "GET",
    'https://secure.shippingapis.com/ShippingAPI.dll?API=CityStateLookup&XML=<CityStateLookupRequest USERID="364SIMPL0013"><ZipCode ID="1"><Zip5>' +
      getToZip +
      "</Zip5></ZipCode></CityStateLookupRequest>",
    true
  );
  xhttp.send();
}

/**
 * Processes the XML response for the 'to' zip code and updates the DOM.
 * @param {XMLDocument} xml - The XML document returned from the AJAX request.
 */
function getTo(xml) {
  var xmlDoc = xml.responseXML;
  var city = xmlDoc.getElementsByTagName("City")[0];
  var state = xmlDoc.getElementsByTagName("State")[0];
  var description = xmlDoc.getElementsByTagName("Description")[0];

  /** Check if the description is present. If not, update DOM with city and state info. */
  if (description === undefined || description.length === 0) {
    city =
      city.textContent.charAt(0).toUpperCase() +
      city.textContent.substr(1).toLowerCase();
    state = state.textContent;
    document.getElementById("toCS").innerHTML = city + ", " + state;
  } else {
    /** If a description is present (typically an error), show an alert with the description. */
    description = description.textContent;
    document.getElementById("toast-message").innerHTML = description;
    document.getElementById("alert-wrap").style.display = "block";
    document.getElementById("zoneInfoWrap").style.display = "none";
    setTimeout(function () {
      document.getElementById("alert-wrap").style.display = "none";
    }, 3000);
  }
}

/**
 * Checks the USPS shipping zone between the 'from' and 'to' zip codes.
 */
function checkZone() {
  if (!getFromZip || !getToZip) return; // Make sure both zip codes are present

  showLoading();

  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
    if (this.readyState === 4 && this.status === 200) {
      // Log the API response

      hideLoading();
      console.log(this.responseXML);
      var zones = this.responseXML.getElementsByTagName("Zone");
      var description = this.responseXML.getElementsByTagName("Description");

      if (zones && zones.length > 0) {
        var zone = zones[0].textContent;
        var zoneColor = zoneColors[zone]; // Get the appropriate color

        colorZip(getFromZip.slice(0, 3), zoneColor); // Color the 'from' ZIP region
        colorZip(getToZip.slice(0, 3), zoneColor); // Color the 'to' ZIP region

        if (zone == 9) {
          document.getElementById("zone").innerHTML =
            "Zone 9: US territories & some Military addresses";
        } else {
          document.getElementById("zone").innerHTML = "Zone " + zone;
        }
      } else if (description && description.length > 0) {
        var errorMsg = description[0].textContent;
        document.getElementById("toast-message").innerHTML = errorMsg;
        document.getElementById("alert-wrap").style.display = "block";
        setTimeout(function () {
          document.getElementById("alert-wrap").style.display = "none";
        }, 3000);
      } else {
        document.getElementById("zone").innerHTML =
          "Zone information not found";
      }
    }
  };

  var requestURL =
    'https://secure.shippingapis.com/ShippingAPI.dll?API=RateV4&XML=<RateV4Request USERID="364SIMPL0013"><Package ID="1ST"><Service>FIRST CLASS</Service><FirstClassMailType>Parcel</FirstClassMailType><ZipOrigination>' +
    getFromZip +
    "</ZipOrigination><ZipDestination>" +
    getToZip +
    "</ZipDestination><Pounds>0</Pounds><Ounces>3</Ounces><Container>Rectangular</Container><Size>Variable</Size><Machinable>true</Machinable></Package></RateV4Request>";
  xhttp.open("GET", requestURL, true);
  xhttp.send();
}

/**
 * Displays a loading spinner and zone info wrapper.
 */
function showLoading() {
  document.getElementById("loadingSpinner").style.display = "block";
  document.getElementById("zoneInfoWrap").style.display = "block";
}

/**
 * Hides the loading spinner.
 */
function hideLoading() {
  document.getElementById("loadingSpinner").style.display = "none";
}

document.addEventListener("DOMContentLoaded", function () {
  loadSVG();
});

/**
 * Loads the SVG map once the document content is loaded.
 */
function loadSVG() {
  var svgContainer = d3.select("#mapContainer");

  d3.xml("zip3ZonesUSA.svg").then(function (data) {
    svgContainer.html("");
    svgContainer.node().appendChild(data.documentElement);

    svgContainer.selectAll("path").on("click", function (d) {
      // If two regions are selected, reset the map and clear the input fields
      if (selectedRegionsCount === 2) {
        resetMapAndInputs();
        selectedRegionsCount = 0; // Reset the count
      }

      var zip3 = d3.select(this).attr("id");
      var fromZipInput = document.getElementById("fromZip");
      var toZipInput = document.getElementById("toZip");

      if (!fromZipInput.value) {
        fromZipInput.value = zip3 + "01"; // append "01"
        getValueFrom();
        selectedRegionsCount++;
      } else if (!toZipInput.value) {
        toZipInput.value = zip3 + "01"; // append "01"
        getValueTo();
        selectedRegionsCount++;
      }
    });
  });
}

/**
 * Resets the map colors and clears the input fields.
 */
function resetMapAndInputs() {
  d3.selectAll("path").style("fill", "#d3d3d3").style("stroke", "white");

  document.getElementById("fromZip").value = "";
  document.getElementById("toZip").value = "";
  document.getElementById("zone").innerHTML = ""; // Reset the text inside the zone span
  document.getElementById("fromCS").innerHTML = ""; // Reset the text inside the fromCS span
  document.getElementById("toCS").innerHTML = ""; // Reset the text inside the toCS span
  getFromZip = undefined;
  getToZip = undefined;
}

/**
 * Resets the colors of the map to their default values.
 */
function resetMapColors() {
  d3.selectAll("path").style("fill", "#d3d3d3").style("stroke", "white");
}

/**
 * Colors a specific zip area on the map.
 * @param {string} zip3 - The 3-digit prefix of the zip code.
 * @param {string} color - The color to apply.
 */
function colorZip(zip3, color) {
  // Assuming each path in the SVG has an id or class corresponding to the 3-digit ZIP prefix
  d3.selectAll(`[id='${zip3}'], [class='${zip3}']`)
    .style("fill", color)
    .style("stroke", color);
}

/**
 * Populates the zone colors legend on the page.
 */
function populateZonesLegend() {
  const legendContainer = document.getElementById("zonesLegend");

  for (const [zone, color] of Object.entries(zoneColors)) {
    const legendItem = document.createElement("div");
    legendItem.classList.add("zoneLegendItem");

    const colorBox = document.createElement("div");
    colorBox.classList.add("zoneColorBox");
    colorBox.style.backgroundColor = color;

    const zoneText = document.createTextNode(`Zone ${zone}`);

    legendItem.appendChild(colorBox);
    legendItem.appendChild(zoneText);

    legendContainer.appendChild(legendItem);
  }
}

// Call the function to populate the legend when the script is loaded.
populateZonesLegend();
