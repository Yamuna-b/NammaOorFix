import { useState, useEffect, useContext } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import IssueForm from "../Components/IssueForm";
import IssueFeed from "../Components/IssueFeed";
import Navbar from "../Components/Navbar";
import { AuthContext } from "../App";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const defaultCenter = [9.9252, 78.1198];

function LocationSelector({ setSelectedLocation }) {
  useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng;
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
        );
        const data = await res.json();
        setSelectedLocation({
          lat,
          lng,
          address: data.display_name || `${lat}, ${lng}`,
        });
      } catch {
        setSelectedLocation({ lat, lng, address: `${lat}, ${lng}` });
      }
    },
  });
  return null;
}

export default function Home() {
  const [issues, setIssues] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetch("http://localhost:5000/issues")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch issues");
        return res.json();
      })
      .then((data) => setIssues(data?.data?.issues || []))
      .catch((err) => {
        console.error("Error fetching issues:", err);
        setIssues([]);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <Navbar user={user} />

      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-500 to-yellow-400 rounded-xl p-8 text-white shadow-lg mb-8">
          <h1 className="text-4xl font-bold">🛠️ CivicConnect</h1>
          <p className="mt-2 text-lg">
            Report local issues and connect with your community
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Map */}
            <div className="rounded-xl overflow-hidden shadow-lg bg-white border border-gray-200">
              <MapContainer
                center={defaultCenter}
                zoom={13}
                style={{ height: "450px", width: "100%" }}
                scrollWheelZoom={true}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationSelector setSelectedLocation={setSelectedLocation} />
                {selectedLocation && (
                  <Marker position={[selectedLocation.lat, selectedLocation.lng]}>
                    <Popup>{selectedLocation.address}</Popup>
                  </Marker>
                )}
                {issues
                  .filter((i) => i.location?.lat && i.location?.lng)
                  .map((i) => (
                    <Marker key={i._id} position={[i.location.lat, i.location.lng]}>
                      <Popup>
                        <div>
                          <h3 className="font-semibold">{i.title}</h3>
                          <p>{i.category}</p>
                          <p>Ward: {i.wardNumber}</p>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
              </MapContainer>
            </div>

            {/* Form */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">
                Report an Issue
              </h2>
              <IssueForm selectedLocation={selectedLocation} />
              <p className="mt-3 text-sm text-gray-600">
                📍 Click on the map to select a location.
              </p>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Stats */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h2 className="text-2xl font-semibold mb-6 text-gray-800">
                Community Stats
              </h2>
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-red-50 p-5 rounded-lg text-center shadow-sm">
                  <p className="text-3xl font-bold text-red-600">247</p>
                  <p className="text-sm text-gray-700">Issues Reported</p>
                </div>
                <div className="bg-yellow-50 p-5 rounded-lg text-center shadow-sm">
                  <p className="text-3xl font-bold text-yellow-600">183</p>
                  <p className="text-sm text-gray-700">Issues Resolved</p>
                </div>
                <div className="bg-red-50 p-5 rounded-lg text-center shadow-sm">
                  <p className="text-3xl font-bold text-red-600">1.2k</p>
                  <p className="text-sm text-gray-700">Active Users</p>
                </div>
                <div className="bg-yellow-50 p-5 rounded-lg text-center shadow-sm">
                  <p className="text-3xl font-bold text-yellow-600">24</p>
                  <p className="text-sm text-gray-700">Wards Covered</p>
                </div>
              </div>
            </div>

            {/* Trending */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h2 className="text-2xl font-semibold mb-6 text-gray-800">
                Trending Issues
              </h2>
              <div className="space-y-5">
                {Array.isArray(issues) && issues.length > 0 ? (
                  issues.slice(0, 3).map((i) => (
                    <div
                      key={i._id}
                      className="border-l-4 border-red-500 pl-4 py-3 bg-gray-50 rounded-md"
                    >
                      <h3 className="font-semibold text-gray-800">
                        {i.title || "Untitled"}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Ward {i.wardNumber || "N/A"} •{" "}
                        {i.likes?.length || 0} likes •{" "}
                        {i.comments?.length || 0} comments
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">
                    No trending issues yet.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Issues Feed */}
        <div className="mt-12">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">
            Recent Issues by Cluster
          </h2>
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <IssueFeed />
          </div>
        </div>
      </div>
    </div>
  );
}
