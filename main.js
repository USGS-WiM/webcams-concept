/*
Created By Erik Myers 3/12/2019
For USGS WiM and USGS UmidWisc Innovation Lab
The application and data are intended as proof of concept only and are not to be used in any official capacity.
*/

var siteInfo;
            // initialize the map
            $(document).ready(function(){
                //json 
                $.getJSON('webcam_site_info.json', function(data){
                    //console.log(data);
                    siteInfo = data;
                });
                
                //send 2 requests because NWIS can only handle 100 at a time.
                var xmlurl1 = 'https://nwis.waterservices.usgs.gov/nwis/site/?format=mapper,1.0&sites=01161280,01426500,01437500,01465500,01480000,01481000,03093000,03339000,04024430,04025500,040734605,040734605,04073462,04079000,04079000,04080000,04080000,04081000,04085108,040851385,04086000,04086000,04086600,04087050,0408708567,0408708572,040870860,04087087,04087119,04087120,04087204,04087214,04087220,04087233,04087234,04087240,04087257,0414826504,0414826504,0414826504,041572269,041572269,041572269,04182000,04183000,04183038,04183500,04183979,04185318,04186500,04188100,04190000,04191444,04192500,04226000,04236000,05287890,05289800,05331833,05333500,05341752,05342000,05342000,05356000,05356500,05359500,05365550,05366800,05367500,05369500,05370000,05379400,05382200,05382267,05382284,05399500,05400760,05401050,05402000,05407000,054187201,054187202,05424057,05427085,05427530,05427718,05427880,05427910,05427927,05427930,05427943,054279465,05427948,05427965,05428500,05429500,05429500,05429700,05430150';
                var xmlurl2 = 'https://nwis.waterservices.usgs.gov/nwis/site/?format=mapper,1.0&sites=05430175,05430500,05433000,05434500,05435943,05435950,05436500,06342500,08361000,13289220,334716104175400,405051083391201,405051083391201,405051083391201,405051083391201,411228084541701,411228084541701,411228084541701,411229084541101,411229084541101,411229084541101,411229084541102,411229084541102,411229084541102,413612087201001,424129077495501,424129077495501,424129077495501,424129077495502,424131077495801,424131077495801,424131077495801,424131077495801,424131077495802,424421077495301,424421077495301,424421077495301,424421077495401,424421077495401,424421077495401,425520078535601,425520078535601,425543078535001,425931087570201,425931087570201,430356089183502,430356089183502,430402089183501,430402089183501,430402089183501,430402089183501,430402089183501,430402089183501,430402089183501,430402089183501,430532089315601,430532089315601,430532089315601,430532089315602,430532089315602,433821090063801,433821090063801,433821090063801,433939090050501,433939090050501,433939090050501,441520088045001,441520088045001,441546088082001,441546088082001,441546088082001,441624088045601,441624088045601,441624088045601,441715088115801,441715088115801,441715088115801,441715088115802,441715088115803,441715088115803,442114088085701,442114088085701,442114088085701,442119088085501,442119088085501,442119088085501,442155087330001,442155087330001,442155087330001,442405087414401,442405087414401,442405087414401,443535087345401,451021089064901,451021089064901,451021089064901,451207089041801,451207089041801,451207089041801,463741090521301';
                var webcamMarkers = {};
                var siteCount = 0;

                
                function getData(url){
                   
                    $.ajax({
                        method: "get",
                        dataType: "xml",
                        url: url,
                        contentType: 'text/xml',
                        success: successCallback
                    });

                    //handle nwis xml site return
                    function successCallback(xml){
                        $(xml).find('site').each(function () {
                            var siteID = $(this).attr('sno');
                            var siteName = $(this).attr('sna');
                            var customPopup = setPopup(siteID);
                            var lat = $(this).attr('lat');
                            var lng = $(this).attr('lng');
                            webcamMarkers[siteID] = L.circleMarker([lat, lng], { fillColor: "red", color:"#000", weight:0, fillOpacity: 0.6, radius: 8 }).bindPopup(customPopup);

                            webcamMarkers[siteID].data = { siteName: siteName, siteCode: siteID };
                            webcamMarkers[siteID].data.parameters = {};

                            //add point to featureGroup
                            sitesLayer.addLayer(webcamMarkers[siteID]);
                            siteCount++;

                        });
                        console.log("running total of sites returned: ", siteCount);
                    }

                    function setPopup(siteID) {
                        var html;
                        Object.keys(siteInfo).forEach(function (key) {
                            if (siteInfo[key].SiteId == siteID) {
                                html = '<div><b>Site Number: </b><a href="https://waterdata.usgs.gov/nwis/uv?site_no=' + siteInfo[key].SiteId + '&Parameter_cd=00065,00060" target="_blank">' + 
                                siteInfo[key].SiteId +'</a><div><b>Description: </b>' + siteInfo[key].siteDesc +'</div></div></br><a href=' 
                                + siteInfo[key].timelapseRoot + siteInfo[key].timelapseLarge + 
                                ' target="_blank"><img width="200" src='+ siteInfo[key].thumbnail +' ></a><div><b>Video Folder: </b><a href=' + 
                                siteInfo[key].timelapseFolder + ' target="_blank">video source</a></div></br><div><b>Frames Gallery: </b><a href=' + 
                                siteInfo[key].timelapseFolder + 'frame_gallery/ target="_blank">100 Frames</a></div></br>';
                            }
                        });
                        return html;
                    }
                }

                
                getData(xmlurl1);
                getData(xmlurl2);
  
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

            var sitesLayer = L.featureGroup().addTo(map);

            //leaflet tilelayer of NWIS sites
            var swActTileLayer = L.tileLayer("https://nwismapper.s3.amazonaws.com/sw_act/{z}/{y}/{x}.png", {zIndex:999,maxZoom:8,errorTileUrl:"https://nwismapper.s3.amazonaws.com/blank.png"}).addTo(map);
            
            //objects for layer controls
            var overlayLayers = {   
                "All Nwis Sites": swActTileLayer,
                "Webcam locations": sitesLayer
            }

            var baseMaps = {
                "Satellite": satellite,
                "Topographic": topo
            }
            
            L.control.layers(baseMaps, overlayLayers).addTo(map);
