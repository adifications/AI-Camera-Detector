/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from "react";
import JSZip from "jszip";
import * as L from "leaflet";
import { motion, AnimatePresence } from "motion/react";
import {
  Camera,
  AlertTriangle,
  Navigation,
  ShieldCheck,
  Search,
  Compass,
  Info,
  UserCheck,
  Zap,
  X,
  FileText,
  AlertCircle,
  Plus,
  Upload,
  Trash2
} from "lucide-react";
import {
  KERALA_AI_CAMERAS,
  KERALA_DISTRICTS,
  calculateDistance,
  AICamera
} from "./cameras";

export default function App() {
  // Disclaimer Acceptance State
  const [isDisclaimerAccepted, setIsDisclaimerAccepted] = useState<boolean>(false);

  // Location & Navigation State
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsStatus, setGpsStatus] = useState<"STANDBY" | "ACTIVE" | "DENIED">("STANDBY");
  const [currentCenter, setCurrentCenter] = useState<{ lat: number; lng: number }>({
    lat: 10.0152, // Standard Center (Kochi / Ernakulam)
    lng: 76.3414
  });

  // UI Selection Filters
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("All");
  const [selectedCamera, setSelectedCamera] = useState<AICamera | null>(null);

  // Custom User Cameras
  const [customCameras, setCustomCameras] = useState<AICamera[]>([]);

  // Fetch custom cameras from server
  const fetchCustomCameras = () => {
    fetch("/api/custom-cameras")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch cameras");
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setCustomCameras(data);
        }
      })
      .catch((err) => {
        console.error("Error loading shared cameras:", err);
      });
  };

  useEffect(() => {
    fetchCustomCameras();
  }, []);

  // Bulk input / manual adding controls
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [bulkInput, setBulkInput] = useState<string>("");
  const [bulkError, setBulkError] = useState<string>("");
  const [fileError, setFileError] = useState<string>("");
  
  // Single Camera Form State
  const [newCamDistrict, setNewCamDistrict] = useState<string>("Ernakulam");
  const [newCamLocation, setNewCamLocation] = useState<string>("");
  const [newCamRoad, setNewCamRoad] = useState<string>("");
  const [newCamLat, setNewCamLat] = useState<string>("");
  const [newCamLng, setNewCamLng] = useState<string>("");
  const [newCamLimitTwo, setNewCamLimitTwo] = useState<number>(50);
  const [newCamLimitFour, setNewCamLimitFour] = useState<number>(60);

  // Combine default cameras with user submitted custom cameras
  const allCameras = [...KERALA_AI_CAMERAS, ...customCameras];

  // Leaflet references
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);

  // Calculate distance for all cameras and sort by proximity
  const camerasWithDistance = allCameras.map((cam) => {
    const originLat = userLocation ? userLocation.lat : currentCenter.lat;
    const originLng = userLocation ? userLocation.lng : currentCenter.lng;
    const distanceMeters = calculateDistance(originLat, originLng, cam.lat, cam.lng);
    return { ...cam, distanceMeters };
  }).sort((a, b) => a.distanceMeters - b.distanceMeters);

  // Filter cameras based on searches & district dropdown
  const filteredCameras = camerasWithDistance.filter((cam) => {
    const matchesDistrict = selectedDistrict === "All" || cam.district === selectedDistrict;
    const matchesSearch =
      cam.locationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cam.roadName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cam.district.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDistrict && matchesSearch;
  });

  // Warning alarm if nearest camera is closer than 1.5 KM
  const nearestCameraRecord = camerasWithDistance[0];
  const activeAlertCamera =
    nearestCameraRecord && nearestCameraRecord.distanceMeters < 1500
      ? nearestCameraRecord
      : null;

  // Request approximate location from IP first for near-instant direct location
  const fetchIpLocation = () => {
    fetch("https://ipapi.co/json/")
      .then((res) => {
        if (!res.ok) throw new Error("IP API response error");
        return res.json();
      })
      .then((data) => {
        if (data && typeof data.latitude === "number" && typeof data.longitude === "number") {
          const coords = { lat: data.latitude, lng: data.longitude };
          setUserLocation((prev) => {
            if (prev) return prev; // If we already have exact GPS, don't overwrite with IP
            
            setCurrentCenter(coords);
            if (mapInstanceRef.current) {
              mapInstanceRef.current.setView([coords.lat, coords.lng], 12);
            }
            return coords;
          });
        }
      })
      .catch((err) => {
        console.warn("Could not retrieve IP-based approximate location:", err);
      });
  };

  // Request browser geolocation access
  const triggerGPSRequest = () => {
    if (!navigator.geolocation) {
      alert("Your browser does not support location services.");
      return;
    }
    setGpsStatus("STANDBY");

    const successCallback = (pos: GeolocationPosition) => {
      const coords = {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude
      };
      setUserLocation(coords);
      setCurrentCenter(coords);
      setGpsStatus("ACTIVE");
      
      // Pan map smoothly to the user location
      if (mapInstanceRef.current) {
        mapInstanceRef.current.setView([coords.lat, coords.lng], 13);
      }
    };

    const errorCallbackLow = (err: any) => {
      console.warn("Low accuracy GPS failed:", err);
      setGpsStatus("DENIED");
    };

    const errorCallbackHigh = (err: any) => {
      console.warn("High accuracy GPS failed, attempting low accuracy...");
      navigator.geolocation.getCurrentPosition(successCallback, errorCallbackLow, {
        enableHighAccuracy: false,
        timeout: 5000,
        maximumAge: 60000
      });
    };

    navigator.geolocation.getCurrentPosition(successCallback, errorCallbackHigh, {
      enableHighAccuracy: true,
      timeout: 4000,
      maximumAge: 0
    });
  };

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Initialize map
    const map = L.map(mapContainerRef.current, {
      center: [currentCenter.lat, currentCenter.lng],
      zoom: 12,
      zoomControl: false,
      scrollWheelZoom: true
    });

    // Light sleek map styling tiles (CartoDB Voyager)
    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      maxZoom: 19
    }).addTo(map);

    L.control.zoom({ position: "bottomright" }).addTo(map);

    mapInstanceRef.current = map;
    markersGroupRef.current = L.layerGroup().addTo(map);

    // Auto trigger IP-based geolocation and GPS permission query on mount gracefully
    fetchIpLocation();
    triggerGPSRequest();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Sync Markers whenever cameras or states change
  useEffect(() => {
    const map = mapInstanceRef.current;
    const group = markersGroupRef.current;
    if (!map || !group) return;

    group.clearLayers();

    // 1. Draw Camera Markers
    filteredCameras.forEach((cam) => {
      const isCritical = activeAlertCamera?.id === cam.id;

      // Premium Indigo or Warm Amber styles for critical alarms
      const iconHtml = `
        <div class="relative flex items-center justify-center cursor-pointer">
          <div class="absolute w-8 h-8 rounded-full ${
            isCritical ? "bg-amber-500/35 animate-pulse" : "bg-emerald-500/10"
          } transition-all duration-300"></div>
          <div class="relative w-5 h-5 rounded-full border flex items-center justify-center shadow-md transition-all duration-300 ${
            isCritical
              ? "bg-amber-500 border-white text-white font-extrabold scale-110"
              : "bg-emerald-600 border-emerald-400 text-white hover:bg-emerald-700 hover:border-emerald-300"
          }">
            <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
            </svg>
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: "leaflet-custom-cam-node",
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const popupContent = `
        <div class="font-sans p-1.5 text-slate-700" style="min-width: 180px;">
          <div class="text-[9px] uppercase font-sans font-bold tracking-wider text-emerald-600">${cam.district} District</div>
          <div class="font-display font-extrabold text-sm text-slate-900 leading-tight mt-0.5">${cam.locationName}</div>
          <div class="text-xs text-slate-500 font-medium mt-1">${cam.roadName}</div>
          
          <div class="h-[1px] bg-slate-100 my-2"></div>
          
          <div class="grid grid-cols-2 gap-2 text-[10px] font-sans">
            <div class="bg-slate-50 p-2 rounded-xl border border-slate-100">
              <span class="block text-[8px] text-slate-400 uppercase">Two Wheeler</span>
              <span class="font-bold text-slate-800">${cam.speedLimitTwoWheeler} km/h</span>
            </div>
            <div class="bg-slate-50 p-2 rounded-xl border border-slate-100">
              <span class="block text-[8px] text-slate-400 uppercase">Four Wheeler</span>
              <span class="font-bold text-slate-800">${cam.speedLimitFourWheeler} km/h</span>
            </div>
          </div>
          
          <div class="h-[1px] bg-slate-100 my-2"></div>
          <div class="text-[9px] text-slate-400 font-semibold mb-1">Actively Monitoring:</div>
          <div class="flex flex-wrap gap-1">
            ${cam.violationsChecked
              .map(
                (v) =>
                  `<span class="bg-emerald-50 text-emerald-600 border border-emerald-100/50 px-1.5 py-0.5 rounded text-[8px] font-bold font-sans">${v}</span>`
              )
              .join("")}
          </div>
        </div>
      `;

      const marker = L.marker([cam.lat, cam.lng], { icon: customIcon })
        .bindPopup(popupContent)
        .addTo(group);

      marker.on("click", () => {
        setSelectedCamera(cam);
        map.panTo([cam.lat, cam.lng]);
      });
    });

    // 2. Draw User Location Marker
    if (userLocation) {
      const userHtml = `
        <div class="relative flex items-center justify-center">
          <div class="absolute w-12 h-12 rounded-full bg-emerald-600/20 animate-pulse"></div>
          <div class="absolute w-20 h-20 rounded-full border border-emerald-400/10 animate-ping"></div>
          <div class="relative w-5 h-5 rounded-full border-2 border-white bg-emerald-600 shadow-xl flex items-center justify-center">
            <div class="w-2.5 h-2.5 rounded-full bg-white animate-pulse"></div>
          </div>
        </div>
      `;

      const userIcon = L.divIcon({
        html: userHtml,
        className: "leaflet-custom-user-node",
        iconSize: [48, 48],
        iconAnchor: [24, 24]
      });

      L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
        .bindPopup(
          `
          <div class="font-sans text-slate-700 text-center p-1">
            <div class="text-[9px] font-sans tracking-widest text-emerald-600 font-bold uppercase">Your Location</div>
            <p class="text-xs mt-0.5 font-medium text-slate-500">Radar actively scanning</p>
          </div>
        `
        )
        .addTo(group);

      // Draw dashed visual line from user to nearby camera
      if (activeAlertCamera) {
        L.polyline(
          [
            [userLocation.lat, userLocation.lng],
            [activeAlertCamera.lat, activeAlertCamera.lng]
          ],
          {
            color: "#059669",
            weight: 1.5,
            dashArray: "4, 6",
            opacity: 0.8
          }
        ).addTo(group);
      }
    }
  }, [filteredCameras, userLocation, activeAlertCamera]);

  const deleteCustomCamera = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to remove this camera?")) {
      fetch(`/api/custom-cameras/${id}`, {
        method: "DELETE"
      })
        .then((res) => {
          if (!res.ok) throw new Error("Failed to delete camera from server");
          return res.json();
        })
        .then(() => {
          setCustomCameras(prev => prev.filter(c => c.id !== id));
          if (selectedCamera?.id === id) {
            setSelectedCamera(null);
          }
        })
        .catch((err) => {
          console.error("Error deleting camera:", err);
          alert("Failed to delete camera from the shared database.");
        });
    }
  };

  const handleAddSingleCamera = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCamLocation || !newCamLat || !newCamLng) {
      alert("Please fill in location, latitude and longitude!");
      return;
    }
    const latNum = parseFloat(newCamLat);
    const lngNum = parseFloat(newCamLng);
    if (isNaN(latNum) || isNaN(lngNum)) {
      alert("Latitude and Longitude must be valid numbers!");
      return;
    }

    const newCam: AICamera = {
      id: `custom-${Date.now()}`,
      district: newCamDistrict,
      locationName: newCamLocation,
      roadName: newCamRoad || "Local Road",
      lat: latNum,
      lng: lngNum,
      speedLimitTwoWheeler: Number(newCamLimitTwo) || 50,
      speedLimitFourWheeler: Number(newCamLimitFour) || 60,
      violationsChecked: ["Helmet", "Seatbelt"],
      description: "User submitted safety camera node."
    };

    fetch("/api/custom-cameras", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newCam)
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to save camera to server");
        return res.json();
      })
      .then(() => {
        setCustomCameras(prev => [newCam, ...prev]);
        // Clear form
        setNewCamLocation("");
        setNewCamRoad("");
        setNewCamLat("");
        setNewCamLng("");
        
        // Zoom/focus to new camera
        selectCameraFocus(newCam);
        alert("Camera successfully added and shared with all users!");
      })
      .catch((err) => {
        console.error("Error saving camera:", err);
        alert("Failed to save camera to the shared database.");
      });
  };

  const handleBulkImport = () => {
    setBulkError("");
    if (!bulkInput.trim()) {
      setBulkError("Input cannot be empty.");
      return;
    }

    try {
      let parsedCams: AICamera[] = [];

      if (bulkInput.trim().startsWith("[")) {
        const items = JSON.parse(bulkInput);
        if (!Array.isArray(items)) {
          throw new Error("JSON must be an array of cameras.");
        }
        items.forEach((item, index) => {
          if (!item.locationName || !item.lat || !item.lng) {
            throw new Error(`Item at index ${index} is missing locationName, lat, or lng.`);
          }
          parsedCams.push({
            id: item.id || `custom-bulk-${Date.now()}-${index}`,
            district: item.district || "Ernakulam",
            locationName: item.locationName,
            roadName: item.roadName || "Main Road",
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lng),
            speedLimitTwoWheeler: Number(item.speedLimitTwoWheeler) || 50,
            speedLimitFourWheeler: Number(item.speedLimitFourWheeler) || 60,
            violationsChecked: Array.isArray(item.violationsChecked) ? item.violationsChecked : ["Helmet", "Seatbelt"],
            description: item.description || "Bulk imported camera node."
          });
        });
      } else {
        const lines = bulkInput.split("\n");
        lines.forEach((line, index) => {
          if (!line.trim()) return;
          const parts = line.split(",").map(p => p.trim());
          if (parts.length < 4) {
            throw new Error(`Line ${index + 1} has insufficient fields. Format: LocationName, District, Latitude, Longitude, [RoadName]`);
          }
          const [locationName, district, latStr, lngStr, roadName] = parts;
          const lat = parseFloat(latStr);
          const lng = parseFloat(lngStr);
          if (isNaN(lat) || isNaN(lng)) {
            throw new Error(`Line ${index + 1} has invalid latitude or longitude.`);
          }
          parsedCams.push({
            id: `custom-csv-${Date.now()}-${index}`,
            district: district || "Ernakulam",
            locationName,
            roadName: roadName || "Local Road",
            lat,
            lng,
            speedLimitTwoWheeler: 50,
            speedLimitFourWheeler: 60,
            violationsChecked: ["Helmet", "Seatbelt"],
            description: "Bulk CSV imported camera node."
          });
        });
      }

      if (parsedCams.length === 0) {
        setBulkError("No valid camera rows found.");
        return;
      }

      fetch("/api/custom-cameras", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsedCams)
      })
        .then((res) => {
          if (!res.ok) throw new Error("Failed to save imported cameras to server");
          return res.json();
        })
        .then(() => {
          setCustomCameras(prev => [...parsedCams, ...prev]);
          setBulkInput("");
          alert(`Successfully imported ${parsedCams.length} camera(s) and shared with all users!`);
          
          if (parsedCams[0]) {
            selectCameraFocus(parsedCams[0]);
          }
        })
        .catch((err) => {
          console.error("Error importing cameras:", err);
          alert("Failed to save imported cameras to the shared database.");
        });
    } catch (err: any) {
      setBulkError(err.message || "Failed to parse. Ensure format is correct.");
    }
  };

  const handleKmlFileUpload = async (file: File) => {
    setFileError("");
    try {
      let kmlContent = "";
      if (file.name.toLowerCase().endsWith(".kmz")) {
        const zip = new JSZip();
        const loadedZip = await zip.loadAsync(file);
        // Find any .kml file inside
        const kmlFile = Object.values(loadedZip.files).find((f) => f.name.toLowerCase().endsWith(".kml"));
        if (!kmlFile) {
          throw new Error("No .kml or doc.kml file found inside the KMZ archive.");
        }
        kmlContent = await kmlFile.async("string");
      } else if (file.name.toLowerCase().endsWith(".kml") || file.name.toLowerCase().endsWith(".xml")) {
        kmlContent = await file.text();
      } else {
        throw new Error("Unsupported file format. Please upload a .kml or .kmz file.");
      }

      // Parse KML
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(kmlContent, "text/xml");
      const placemarks = xmlDoc.getElementsByTagName("Placemark");
      
      if (placemarks.length === 0) {
        throw new Error("No camera locations (Placemarks) found in the file.");
      }

      const parsedCams: AICamera[] = [];
      for (let i = 0; i < placemarks.length; i++) {
        const placemark = placemarks[i];
        const nameEl = placemark.getElementsByTagName("name")[0];
        const name = nameEl?.textContent?.trim() || `Camera ${i + 1}`;
        
        const descEl = placemark.getElementsByTagName("description")[0];
        const desc = descEl?.textContent?.trim() || "Imported KMZ/KML Node";
        
        // Find coordinates tag (can be nested under Point, LineString, etc. - we care about Point)
        const coordEl = placemark.getElementsByTagName("coordinates")[0];
        if (!coordEl) continue;
        
        const coordText = coordEl.textContent?.trim() || "";
        // coordinates tag contains space/comma/newline separated parts like "lng,lat,alt"
        const coordParts = coordText.split(/[\s,]+/);
        if (coordParts.length >= 2) {
          const lng = parseFloat(coordParts[0]);
          const lat = parseFloat(coordParts[1]);
          if (!isNaN(lat) && !isNaN(lng)) {
            // Check for district matching
            let district = "Ernakulam";
            for (const dist of KERALA_DISTRICTS) {
              if (name.toLowerCase().includes(dist.toLowerCase()) || desc.toLowerCase().includes(dist.toLowerCase())) {
                district = dist;
                break;
              }
            }
            
            parsedCams.push({
              id: `kml-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 7)}`,
              district,
              locationName: name,
              roadName: "Imported Map Source",
              lat,
              lng,
              speedLimitTwoWheeler: 50,
              speedLimitFourWheeler: 60,
              violationsChecked: ["Helmet", "Seatbelt", "Speeding"],
              description: desc
            });
          }
        }
      }

      if (parsedCams.length === 0) {
        throw new Error("No valid camera coordinates could be parsed from the file.");
      }

      fetch("/api/custom-cameras", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsedCams)
      })
        .then((res) => {
          if (!res.ok) throw new Error("Failed to save KML cameras to server");
          return res.json();
        })
        .then(() => {
          setCustomCameras(prev => [...parsedCams, ...prev]);
          alert(`Successfully imported ${parsedCams.length} camera(s) from "${file.name}" and shared with all users!`);
          
          if (parsedCams[0]) {
            selectCameraFocus(parsedCams[0]);
          }
        })
        .catch((err) => {
          console.error("Error saving KML cameras:", err);
          alert("Failed to save KML cameras to the shared database.");
        });
    } catch (err: any) {
      setFileError(err.message || "An error occurred while parsing the file.");
    }
  };

  const selectCameraFocus = (cam: AICamera) => {
    setSelectedCamera(cam);
    const pos = { lat: cam.lat, lng: cam.lng };
    setCurrentCenter(pos);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([cam.lat, cam.lng], 15);
    }
  };

  const handleDistrictSelect = (district: string) => {
    setSelectedDistrict(district);
    if (district === "All") {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.setView([10.15, 76.5], 8);
      }
      return;
    }

    const coordinates: Record<string, [number, number]> = {
      Thiruvananthapuram: [8.5244, 76.9614],
      Kollam: [8.8872, 76.5888],
      Pathanamthitta: [9.2642, 76.7872],
      Alappuzha: [9.4921, 76.3382],
      Kottayam: [9.5936, 76.5218],
      Idukki: [10.0136, 76.9536],
      Ernakulam: [9.9828, 76.2978],
      Thrissur: [10.525, 76.2144],
      Palakkad: [10.7714, 76.6545],
      Malappuram: [11.0736, 76.0722],
      Kozhikode: [11.2582, 75.7812],
      Wayanad: [11.6089, 76.0858],
      Kannur: [11.8789, 75.3712],
      Kasaragod: [12.4982, 74.9889]
    };

    const targetLoc = coordinates[district];
    if (targetLoc && mapInstanceRef.current) {
      setCurrentCenter({ lat: targetLoc[0], lng: targetLoc[1] });
      mapInstanceRef.current.setView(targetLoc, 11);
    }
  };

  const acceptDisclaimer = () => {
    setIsDisclaimerAccepted(true);
    fetchIpLocation();
    triggerGPSRequest();
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc] text-slate-800 font-sans selection:bg-emerald-100 selection:text-emerald-900 relative overflow-x-hidden">
      
      {/* 1. COMPULSORY SAFETY WARNING & LIABILITY DISCLAIMER OVERLAY */}
      <AnimatePresence>
        {!isDisclaimerAccepted && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="bg-white border border-slate-200/80 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl"
              id="disclaimer-alert-modal"
            >
              {/* Premium Light Warning Bar */}
              <div className="bg-slate-50 px-6 py-5 border-b border-slate-100 flex items-center gap-3.5">
                <div className="bg-emerald-50 p-2.5 rounded-2xl border border-emerald-100">
                  <AlertCircle className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h2 className="font-display font-extrabold text-lg text-slate-950 tracking-wide uppercase">
                    Safety Warning &amp; Disclaimer
                  </h2>
                  <p className="text-[10px] text-emerald-600 font-sans tracking-widest uppercase">
                    MVD Kerala Compliance Agreement
                  </p>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <p className="text-slate-600 text-[13px] leading-relaxed">
                  This safety radar is designed solely for <span className="text-emerald-600 font-bold">educational, safe driving, and compliance-reminder purposes</span>. It maps registered Motor Vehicle Department (MVD) AI cameras across Kerala.
                </p>

                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-3 text-[12px] text-slate-600">
                  <div className="flex gap-3 items-start">
                    <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-display font-semibold text-slate-900">Promoting Safe Driving Only</h4>
                      <p className="text-[11px] text-slate-500 leading-normal mt-0.5">
                        This application encourages drivers to wear seatbelts, put on safety helmets, and respect speed regulations. It strictly does <span className="text-slate-900 font-semibold">NOT</span> promote, endorse, or facilitate reckless driving or traffic evasion.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 items-start border-t border-slate-200/50 pt-3">
                    <FileText className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-display font-semibold text-slate-900">Developer Liability Waiver</h4>
                      <p className="text-[11px] text-slate-500 leading-normal mt-0.5">
                        The developer is <span className="font-bold text-slate-900 underline">not responsible</span> for any traffic tickets, fines, citation penalties, driving violations, or accidents. Compliance with all road safety laws is the sole legal responsibility of the driver.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 items-start border-t border-slate-200/50 pt-3 text-amber-800 bg-amber-50/40 p-3 rounded-2xl border border-amber-100">
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-display font-semibold text-amber-900">Camera Database Warning</h4>
                      <p className="text-[11px] text-amber-700 leading-normal mt-0.5 font-sans">
                        Please note that <span className="font-bold">some AI cameras might not be added yet</span>, and hence relying solely on this radar could be troubling. Always maintain alert, safe driving habits regardless of radar indicators.
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-[10px] text-slate-400 italic text-center">
                  By clicking accept, you acknowledge and agree to drive safely.
                </p>
              </div>

              {/* Accept Trigger Button */}
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                <button
                  onClick={acceptDisclaimer}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-display font-bold text-xs py-3 px-6 rounded-full flex items-center gap-2 transition-all active:scale-98 cursor-pointer shadow-md shadow-emerald-100 hover:shadow-emerald-200"
                  id="agree-rules-trigger"
                >
                  <UserCheck className="w-4 h-4" />
                  I AGREE & ACCEPTS TERMS
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* HEADER LOGO SECTION - Beautiful floating white container */}
      <div className="max-w-7xl mx-auto w-full px-4 pt-4 md:px-6 relative z-[1000]">
        <header className="bg-white border border-slate-200/80 px-5 py-4 rounded-3xl shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="bg-emerald-600 text-white p-3 rounded-2xl relative shadow-md shadow-emerald-100">
                <Camera className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display font-extrabold text-lg tracking-wide text-slate-900 uppercase flex items-center gap-1.5">
                  AI CAMERA TRACKER
                  <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                </h1>
              </div>
              <p className="text-[10px] text-emerald-600 font-sans tracking-wider uppercase">
                Safety Compliance Companion
              </p>
            </div>
          </div>

          {/* Add/Import Camera controls & GPS */}
          <div className="flex items-center gap-3 font-sans text-[11px] w-full md:w-auto justify-end">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className={`px-4.5 py-2 rounded-full border transition-all duration-300 flex items-center gap-1.5 cursor-pointer shadow-sm ${
                showAddForm
                  ? "bg-emerald-600 text-white border-emerald-500 font-bold shadow-emerald-100"
                  : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300"
              }`}
              title="Add custom camera or import source data"
            >
              <Plus className="w-4 h-4" />
              Add/Import Camera
            </button>

            <button
              onClick={triggerGPSRequest}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4.5 py-2 rounded-full font-bold uppercase transition-all duration-300 text-[10px] cursor-pointer shadow-md shadow-emerald-100 active:scale-95"
            >
              Share Location
            </button>
          </div>

        </header>
      </div>

      {/* ALERTS NOTIFICATION BANNER WHEN CAMERA IS WITHIN 1.5 KM */}
      <AnimatePresence>
        {activeAlertCamera && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-amber-50 border-b border-amber-200 px-4 py-3"
          >
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="bg-amber-500 text-white p-1.5 rounded-full animate-bounce">
                  <Navigation className="w-4 h-4 shrink-0" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-xs uppercase text-amber-800">
                    Proximity Notification
                  </h3>
                  <p className="text-slate-700 text-[11px] leading-tight">
                    Approaching camera at <span className="font-bold text-slate-900">{activeAlertCamera.locationName}</span> ({activeAlertCamera.roadName})
                  </p>
                </div>
              </div>

              <div className="flex gap-4 font-mono text-[11px]">
                <div className="bg-white border border-amber-200/60 px-2.5 py-1 rounded shadow-sm">
                  <span className="text-slate-400 uppercase text-[9px] block">Distance</span>
                  <span className="text-amber-700 font-bold">
                    {(activeAlertCamera.distanceMeters / 1000).toFixed(2)} km
                  </span>
                </div>

                <div className="bg-white border border-amber-200/60 px-2.5 py-1 rounded shadow-sm">
                  <span className="text-slate-400 uppercase text-[9px] block">Bike Limit</span>
                  <span className="text-amber-700 font-bold">
                    {activeAlertCamera.speedLimitTwoWheeler} km/h
                  </span>
                </div>

                <div className="bg-white border border-amber-200/60 px-2.5 py-1 rounded shadow-sm">
                  <span className="text-slate-400 uppercase text-[9px] block">Car Limit</span>
                  <span className="text-amber-700 font-bold">
                    {activeAlertCamera.speedLimitFourWheeler} km/h
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 max-w-7xl mx-auto p-4 md:p-6 w-full grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
        
        {/* ADD & BULK IMPORT CAMERA FORM PANEL */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0, height: 0, scale: 0.98 }}
              animate={{ opacity: 1, height: "auto", scale: 1 }}
              exit={{ opacity: 0, height: 0, scale: 0.98 }}
              transition={{ duration: 0.3 }}
              className="lg:col-span-12 overflow-hidden bg-white border border-slate-200 rounded-3xl shadow-md"
            >
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Plus className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-display font-bold text-sm uppercase text-slate-800 tracking-wider">
                    Add Custom Cameras &amp; Import Dataset Sources
                  </h3>
                </div>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Option 1: Single Camera Form */}
                <form onSubmit={handleAddSingleCamera} className="space-y-4">
                  <h4 className="text-[10px] font-sans tracking-wider uppercase text-emerald-600 border-b border-slate-100 pb-2 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                    Option 1: Add Single Camera
                  </h4>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[9px] text-slate-500 uppercase font-sans mb-1.5">District</label>
                      <select
                        value={newCamDistrict}
                        onChange={(e) => setNewCamDistrict(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3 py-2 text-xs font-sans focus:outline-none focus:border-emerald-500 cursor-pointer"
                      >
                        {KERALA_DISTRICTS.map((dist) => (
                          <option key={dist} value={dist}>{dist}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[9px] text-slate-500 uppercase font-sans mb-1.5">Location / Junction</label>
                      <input
                        type="text"
                        placeholder="e.g. Vytila Junction"
                        value={newCamLocation}
                        onChange={(e) => setNewCamLocation(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 text-slate-800 placeholder:text-slate-400 rounded-xl px-3 py-2 text-xs font-sans focus:outline-none focus:border-emerald-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2">
                      <label className="block text-[9px] text-slate-500 uppercase font-sans mb-1.5">Road Name</label>
                      <input
                        type="text"
                        placeholder="e.g. NH 66 Bypass"
                        value={newCamRoad}
                        onChange={(e) => setNewCamRoad(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 text-slate-800 placeholder:text-slate-400 rounded-xl px-3 py-2 text-xs font-sans focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] text-slate-500 uppercase font-sans mb-1.5">Bike Limit</label>
                      <input
                        type="number"
                        value={newCamLimitTwo}
                        onChange={(e) => setNewCamLimitTwo(Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3 py-2 text-xs font-sans focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[9px] text-slate-500 uppercase font-sans mb-1.5">Latitude</label>
                      <input
                        type="text"
                        placeholder="e.g. 10.0152"
                        value={newCamLat}
                        onChange={(e) => setNewCamLat(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 text-slate-800 placeholder:text-slate-400 rounded-xl px-3 py-2 text-xs font-sans focus:outline-none focus:border-emerald-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] text-slate-500 uppercase font-sans mb-1.5">Longitude</label>
                      <input
                        type="text"
                        placeholder="e.g. 76.3414"
                        value={newCamLng}
                        onChange={(e) => setNewCamLng(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 text-slate-800 placeholder:text-slate-400 rounded-xl px-3 py-2 text-xs font-sans focus:outline-none focus:border-emerald-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] text-slate-500 uppercase font-sans mb-1.5">Car Limit</label>
                      <input
                        type="number"
                        value={newCamLimitFour}
                        onChange={(e) => setNewCamLimitFour(Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3 py-2 text-xs font-sans focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex justify-between items-center">
                    <span className="text-[9px] text-slate-400 italic">
                      *Saved to browser cache
                    </span>
                    <button
                      type="submit"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-sans font-bold py-2 px-4 rounded-full transition-all cursor-pointer flex items-center gap-1 shadow-md shadow-emerald-100"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Camera
                    </button>
                  </div>
                </form>

                {/* Option 2: Bulk Import Form */}
                <div className="space-y-4 flex flex-col justify-between">
                  <div>
                    <h4 className="text-[10px] font-sans tracking-wider uppercase text-emerald-600 border-b border-slate-100 pb-2 flex items-center gap-1.5">
                      <Upload className="w-3.5 h-3.5" />
                      Option 2: Import Camera Dataset / Source
                    </h4>
                    <p className="text-[9.5px] text-slate-500 leading-normal mt-1.5 mb-2.5">
                      Paste a list of camera coordinates (Comma-Separated rows or JSON array) below:
                    </p>

                    <textarea
                      rows={3}
                      value={bulkInput}
                      onChange={(e) => setBulkInput(e.target.value)}
                      placeholder="Format: LocationName, District, Latitude, Longitude&#10;e.g. Edappally Toll, Ernakulam, 10.0261, 76.3115"
                      className="w-full bg-slate-50 border border-slate-200 text-slate-800 placeholder:text-slate-400 rounded-2xl p-3.5 text-xs font-sans focus:outline-none focus:border-emerald-500 resize-none h-[110px]"
                    />

                    {bulkError && (
                      <p className="text-[9px] text-red-500 font-mono mt-1">
                        Error: {bulkError}
                      </p>
                    )}

                    {/* Drag and Drop Zone for KML / KMZ */}
                    <div className="mt-4">
                      <label className="block text-[9px] text-slate-500 uppercase font-sans mb-1.5">Or Upload KML / KMZ Map File</label>
                      <div
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={async (e) => {
                          e.preventDefault();
                          const file = e.dataTransfer.files?.[0];
                          if (file) {
                            await handleKmlFileUpload(file);
                          }
                        }}
                        className="border border-dashed border-slate-200 hover:border-emerald-400 bg-slate-50 rounded-2xl p-5 text-center cursor-pointer transition-all hover:bg-emerald-50/20 group"
                        onClick={() => {
                          const fileInput = document.getElementById("kml-file-upload") as HTMLInputElement;
                          fileInput?.click();
                        }}
                      >
                        <input
                          id="kml-file-upload"
                          type="file"
                          accept=".kml,.kmz"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              await handleKmlFileUpload(file);
                            }
                          }}
                        />
                        <Upload className="w-6 h-6 text-emerald-400 group-hover:text-emerald-500 mx-auto mb-2 transition-colors" />
                        <p className="text-[10px] text-slate-600 font-sans">
                          Drag &amp; Drop <span className="text-emerald-600 font-bold">.kmz</span> or <span className="text-emerald-600 font-bold">.kml</span> here
                        </p>
                        <p className="text-[8px] text-slate-400 font-sans mt-0.5">
                          or click to browse files
                        </p>
                      </div>
                      {fileError && (
                        <p className="text-[9px] text-red-400 font-mono mt-1">
                          File Error: {fileError}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 flex justify-between items-center border-t border-slate-100">
                    <div className="flex gap-2">
                      <button
                        onClick={handleBulkImport}
                        className="bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-700 hover:text-slate-800 text-[10px] font-mono font-bold py-2 px-4 rounded-full transition-all cursor-pointer flex items-center gap-1 shadow-sm"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        Import Text Source
                      </button>

                      {customCameras.length > 0 && (
                        <button
                          onClick={() => {
                            if (window.confirm("Clear all custom user-added cameras?")) {
                              setCustomCameras([]);
                              localStorage.removeItem("kerala_custom_cameras");
                            }
                          }}
                          className="bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 text-[10px] font-mono py-2 px-3.5 rounded-full transition-all cursor-pointer flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Clear Custom ({customCameras.length})
                        </button>
                      )}
                    </div>

                    <span className="text-[8.5px] text-slate-400">
                      Supports direct My Maps KMZ!
                    </span>
                  </div>

                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* LEFT COLUMN: THE MAP VISUALIZER */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm flex flex-col h-full relative">
            
            {/* Map Header details */}
            <div className="bg-slate-50 px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="flex items-center gap-2 font-sans text-[11px]">
                <Compass className="w-4 h-4 text-emerald-600" />
                <span className="text-slate-900 font-bold uppercase tracking-wider">Kerala AI Cameras Radar Map</span>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                {/* District Filter jump dropdown */}
                <select
                  value={selectedDistrict}
                  onChange={(e) => handleDistrictSelect(e.target.value)}
                  className="bg-white border border-slate-200 text-slate-800 rounded-full py-1.5 px-4 text-[11px] font-sans focus:outline-none focus:border-emerald-500 cursor-pointer shadow-sm"
                >
                  <option value="All">All 14 Districts (Kerala)</option>
                  {KERALA_DISTRICTS.map((dist) => (
                    <option key={dist} value={dist}>
                      {dist}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Map Canvas */}
            <div
              ref={mapContainerRef}
              className="w-full flex-1 min-h-[480px] relative z-10"
              style={{ minHeight: "480px" }}
            >
              <div className="absolute inset-0 bg-[#f8f9fa] flex flex-col items-center justify-center z-[1] p-4 text-center">
                <Compass className="w-8 h-8 text-emerald-600 animate-spin" />
                <p className="text-xs text-slate-500 mt-2 font-sans">Loading GPS Safe-Driving Map...</p>
              </div>
            </div>

            {/* Map Legenda */}
            <div className="bg-slate-50 px-5 py-3 border-t border-slate-100 text-[10px] font-sans text-slate-500 flex flex-wrap justify-between items-center gap-3">
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                Standard MVD AI Camera
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                Camera proximity range alert
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-white border border-emerald-600"></span>
                Your GPS position
              </span>
            </div>

          </div>
        </div>

        {/* RIGHT COLUMN: PENALTIES & LOCAL LIST WITH DISTANCE */}
        <div className="lg:col-span-4 flex flex-col gap-6">

          {/* 1. MVD OFFENSES & FINE RATES */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
            <h2 className="text-xs font-display font-extrabold text-slate-900 uppercase tracking-widest mb-2 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              MVD AI Camera Fine Rates
            </h2>
            <p className="text-[10px] text-slate-500 leading-normal mb-3.5">
              Automated fines detected via advanced ANPR and image analysis systems in Kerala:
            </p>

            <div className="space-y-2 text-[11px]">
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex justify-between items-center hover:border-slate-200 transition-all duration-300">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                  <span className="text-slate-700">No Helmet (Rider/Pillion)</span>
                </div>
                <span className="font-sans font-bold text-emerald-600">₹500</span>
              </div>

              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex justify-between items-center hover:border-slate-200 transition-all duration-300">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                  <span className="text-slate-700">No Seatbelt (Driver/Cabin)</span>
                </div>
                <span className="font-sans font-bold text-emerald-600">₹500</span>
              </div>

              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex justify-between items-center hover:border-slate-200 transition-all duration-300">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                  <span className="text-slate-700">Triple Riding (Two Wheeler)</span>
                </div>
                <span className="font-sans font-bold text-emerald-600">₹1,000</span>
              </div>

              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex justify-between items-center hover:border-slate-200 transition-all duration-300">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                  <span className="text-slate-700">Over-speeding (Fine starts)</span>
                </div>
                <span className="font-sans font-bold text-emerald-600">₹1,500</span>
              </div>

              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex justify-between items-center hover:border-slate-200 transition-all duration-300">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                  <span className="text-slate-700">Mobile Phone Use</span>
                </div>
                <span className="font-sans font-bold text-emerald-600">₹2,000</span>
              </div>
            </div>
          </div>

          {/* 2. THE LIST OF AI CAMERAS NEARBY ALONG WITH DISTANCE */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm flex-1 flex flex-col min-h-[340px]">
            
            <div className="space-y-3 mb-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xs font-display font-extrabold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                  <Zap className="w-4 h-4 text-emerald-600" />
                  Nearby AI Cameras List
                </h2>
                <span className="text-[10px] font-sans bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 text-emerald-600">
                  {filteredCameras.length} active
                </span>
              </div>

              {/* Dynamic search input box */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-4 top-3" />
                <input
                  type="text"
                  placeholder="Filter by junction, road..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 placeholder:text-slate-400 rounded-full py-2 pl-10 pr-4 text-xs font-sans focus:outline-none focus:border-emerald-500 transition-all"
                />
              </div>
            </div>

            {/* List entries sorted by closest distance */}
            <div className="space-y-2 overflow-y-auto pr-1 flex-1 max-h-[360px]">
              {filteredCameras.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center p-6 text-center text-slate-400">
                  <X className="w-7 h-7 mb-1" />
                  <p className="text-xs font-sans">No cameras found matching current criteria.</p>
                </div>
              ) : (
                filteredCameras.map((cam) => {
                  const isUnderRange = cam.distanceMeters < 1500;
                  const distanceText =
                    cam.distanceMeters < 1000
                      ? `${Math.round(cam.distanceMeters)} m`
                      : `${(cam.distanceMeters / 1000).toFixed(1)} km`;

                  return (
                    <div
                      key={cam.id}
                      onClick={() => selectCameraFocus(cam)}
                      className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all duration-300 ${
                        isUnderRange
                          ? "bg-emerald-50/40 border-emerald-200 hover:border-emerald-300"
                          : "bg-slate-50/50 border-slate-100 hover:bg-slate-50 hover:border-slate-200 hover:shadow-sm"
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="min-w-0">
                          <span className="text-[9px] uppercase font-sans font-bold text-emerald-600 block">
                            {cam.district}
                          </span>
                          <h3 className="font-display font-bold text-xs text-slate-800 truncate mt-0.5">
                            {cam.locationName}
                          </h3>
                          <p className="text-[10px] text-slate-500 truncate mt-0.5">
                            {cam.roadName}
                          </p>
                        </div>

                        {/* Beautiful simple distance counter */}
                        <div className="text-right shrink-0 flex items-center gap-2">
                          {cam.id.startsWith("custom") && (
                            <button
                              onClick={(e) => deleteCustomCamera(cam.id, e)}
                              className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-1 transition-colors rounded cursor-pointer"
                              title="Delete this custom camera"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <span className="text-[11px] font-sans font-extrabold bg-emerald-50 text-emerald-600 border border-emerald-100 px-2.5 py-1 rounded-xl">
                            {distanceText}
                          </span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center mt-2.5 pt-2.5 border-t border-slate-200/50 text-[9px] font-sans text-slate-500">
                        <span>Speed Limit: <span className="text-slate-700 font-bold">{cam.speedLimitFourWheeler} km/h</span></span>
                        
                        <div className="flex gap-1">
                          {cam.violationsChecked.slice(0, 2).map((v, idx) => (
                            <span key={idx} className="bg-slate-100 text-[8px] text-slate-600 px-2 py-0.5 rounded-full border border-slate-200/50">
                              {v}
                            </span>
                          ))}
                        </div>
                      </div>

                    </div>
                  );
                })
              )}
            </div>

          </div>

          {/* MANDATORY LEGAL EXEMPTION FOOTNOTE */}
          <div className="bg-white border border-slate-200 p-4 rounded-3xl flex items-start gap-2.5 shadow-sm">
            <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p className="text-[9.5px] text-slate-500 leading-normal">
              Disclaimer: Listing location reference data is provided strictly to enhance civic road-rules awareness and safety compliance. Drive with utmost caution at all times.
            </p>
          </div>

        </div>

      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-[11px] text-slate-500 relative z-10 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p>© {new Date().getFullYear()} AI Camera Tracker. Promoting defensive driving practices.</p>
          <p className="text-slate-400">Developed by <span className="font-semibold text-slate-700">Aditya Nair - @adifications</span></p>
        </div>
      </footer>

    </div>
  );
}
