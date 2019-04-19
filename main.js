/*
Created By Erik Myers 3/12/2019
For USGS WiM and USGS UmidWisc Innovation Lab
The application and data are intended as proof of concept only and are not to be used in any official capacity.
*/

var siteInfo;
var xmlSites;
            // initialize the map
            $(document).ready(function(){
               $.get('sites.xml', function (xml) {
                    xmlSites = xml
                    console.log('DEV NOTE: this version using local xml file for latlng lookup');
                    startComparison();
                }); 
                function startComparison(){
                    var webcamMarkers = {};
                    $.getJSON('exported_sits_v3.json', function (data) {
                        //console.log(data);
                        siteInfo = data;
                        var count = 0;
                        $(siteInfo).each(function (index, site) {
                            //console.log(site);
                            var siteID = site.SiteId;
                            var siteName = site.siteDesc;
                            var customPopup = '<div><b>Site Number: </b><a href="https://waterdata.usgs.gov/nwis/uv?site_no=' + site.SiteId + '&Parameter_cd=00065,00060" target="_blank">' +
                               site.SiteId + '</a><div><b>Description: </b>' + site.siteDesc + '</div></div></br><a href='
                                + site.timelapseRoot + site.timelapseLarge +
                                ' target="_blank"><img width="200" src=' + site.thumbnail + ' ></a><div>click image to open full-size video</div></br><div><b>Video Folder: </b><a href=' +
                                site.timelapseFolder + ' target="_blank">Index of videos and images</a></div><div><b>Frames Gallery: </b><a href=' +
                               site.timelapseFolder + 'frame_gallery/ target="_blank">Last 100 Frames</a></div></br>' +
                               '<div><b>Site Type: </b>' + site.SiteType2 + '</div></br>';
                            var latlngArr = findSite(siteID);

                            //only continue if valid latlng found
                            if (latlngArr[0] != "error") {
                                //if (site.SiteType2 == "stream"){
                                    webcamMarkers[siteID] = L.circleMarker(latlngArr, { fillColor: "#d11010", color: "#000", weight: 0, fillOpacity: 0.6, radius: 8 }).bindPopup(customPopup);
                                    streamLayer.addLayer(webcamMarkers[siteID])
                               /*  } else{
                                    webcamMarkers[siteID] = L.circleMarker(latlngArr, { fillColor: "#d11010", color: "#000", weight: 0, fillOpacity: 0.6, radius: 8 }).bindPopup(customPopup);
                                    sitesLayer.addLayer(webcamMarkers[siteID])
                                } */
                                
                                count++;
                            }


                        });
                        console.log("count = ", count);

                        function findSite(siteId) {
                            var latlng = [];
                            var fakelat = 0;
                            $(xmlSites).find('site').each(function () {
                                if ($(this).attr('sno') == siteId) {
                                    latlng.push($(this).attr('lat'));
                                    latlng.push($(this).attr('lng'));
                                }
                            });
                            //return latlng only if the site is found in the NWIS sites.xml
                            if (latlng.length > 0) {
                                if (latlng.length > 2) {
                                    var newLatLng = latlng.slice(0,2);
                                    return newLatLng;
                                    
                                } else {
                                    return latlng;
                                }   
                                
                            } else {
                                console.log('unable to find site in NWIS return: ', siteId)
                                latlng.push('error');
                                return latlng;
                            }

                        }
                    });//end getJSON
                }//end startComparison

            }); //end self-invoking jquery func
            
            // setup basemaps, add one in map instantiation below
            var topo = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}", {
                attribution: ""
            });

            var satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
                attribution: ''
            });

            var map = L.map("map", {
                center: [38.0, -97.6],
                zoom: 5,
                layers: [topo]
            });

            //create markercluster group
            var mcg = L.markerClusterGroup({showCoverageOnHover: false, maxClusterRadius:.1, spiderfyDistanceMultiplier: 2}).addTo(map);
            //var siteClusterGroup = L.markerClusterGroup({ showCoverageOnHover: false, maxClusterRadius: .1, spiderfyDistanceMultiplier: 2 }).addTo(map);

            //add markerClusters to feature group
            var streamLayer = L.featureGroup.subGroup(mcg).addTo(map);
            var sitesLayer = L.featureGroup.subGroup(mcg).addTo(map);
            
            

            //leaflet tilelayer of NWIS sites
            var swActTileLayer = L.tileLayer("https://nwismapper.s3.amazonaws.com/sw_act/{z}/{y}/{x}.png", {zIndex:999,maxZoom:8,errorTileUrl:"https://nwismapper.s3.amazonaws.com/blank.png"})
            
            //objects for layer controls
            var overlayLayers = {   
                "Stream Webcams": streamLayer,
                "Other Webcam locations": sitesLayer,
                "All Nwis Sites": swActTileLayer
            }

            var baseMaps = {
                "Satellite": satellite,
                "Topographic": topo
            }
            
            L.control.layers(baseMaps, overlayLayers).addTo(map);
