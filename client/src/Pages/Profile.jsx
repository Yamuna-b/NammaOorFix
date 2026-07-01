import React, { useState, useEffect } from "react";
import axios from "axios";

export default function Profile() {
  const [activeTab, setActiveTab] = useState("issues");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  const [user, setUser] = useState({
    name: "Loading...",
    username: "Loading...",
    bio: "Loading bio...",
    avatar: "",
    followers: 0,
    following: 0,
    issues: 0,
    issuesList: [],
  });

  const [editData, setEditData] = useState({});
  const [avatarPreview, setAvatarPreview] = useState("");

  const token = localStorage.getItem("token");

  // Fallback avatar
  const defaultAvatar =
    "https://ui-avatars.com/api/?name=User&background=random&color=fff";

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    axios
      .get("http://localhost:5000/user/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const data = res.data;
        const avatar = data.avatar || defaultAvatar;
        setUser({ ...data, avatar });
        setEditData({
          name: data.name || "",
          username: data.username || "",
          bio: data.bio || "",
        });
        setAvatarPreview(avatar);
      })
      .catch(() => {
        setUser({
          name: "Guest User",
          username: "guest",
          bio: "No bio available.",
          avatar: defaultAvatar,
          followers: 0,
          following: 0,
          issues: 0,
          issuesList: [],
        });
        setAvatarPreview(defaultAvatar);
      })
      .finally(() => setLoading(false));
  }, [token]);

  const handleSave = () => {
    if (!token) return;

    const formData = new FormData();
    formData.append("name", editData.name);
    formData.append("username", editData.username);
    formData.append("bio", editData.bio);
    if (editData.avatar) formData.append("avatar", editData.avatar);

    axios
      .put("http://localhost:5000/user/update", formData, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const updated = res.data;
        const avatar = updated.avatar || defaultAvatar;
        setUser({ ...updated, avatar });
        setAvatarPreview(avatar);
        setIsEditing(false);
      })
      .catch(() => alert("Error saving profile. Try again."));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditData({ ...editData, avatar: file });
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 via-gray-50 to-white">
      <main className="max-w-4xl mx-auto px-6 py-10">
        <section className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Banner */}
          <div className="h-36 bg-gradient-to-r from-red-500 to-yellow-400 relative">
            <div className="absolute -bottom-16 left-6">
              <img
                className="h-32 w-32 rounded-full border-4 border-white object-cover shadow-lg"
                src={avatarPreview || defaultAvatar}
                alt="Profile avatar"
              />
            </div>
          </div>

          {/* Profile Info */}
          <div className="pt-20 px-6 pb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              {!isEditing ? (
                <>
                  <div>
                    <h1 className="text-3xl font-extrabold text-gray-900">
                      {user.name}
                    </h1>
                    <p className="text-red-600 text-lg">@{user.username}</p>
                  </div>
                  {!loading && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="mt-4 md:mt-0 px-6 py-2 rounded-full font-semibold text-sm shadow-md transition-all duration-300 bg-blue-600 text-white hover:bg-blue-700"
                    >
                      Edit Profile
                    </button>
                  )}
                </>
              ) : (
                <div className="w-full">
                  <div className="grid gap-3">
                    <input
                      className="border rounded-lg px-3 py-2 w-full"
                      placeholder="Name"
                      value={editData.name}
                      onChange={(e) =>
                        setEditData({ ...editData, name: e.target.value })
                      }
                    />
                    <input
                      className="border rounded-lg px-3 py-2 w-full"
                      placeholder="Username"
                      value={editData.username}
                      onChange={(e) =>
                        setEditData({ ...editData, username: e.target.value })
                      }
                    />
                    <textarea
                      className="border rounded-lg px-3 py-2 w-full"
                      placeholder="Your bio..."
                      value={editData.bio}
                      onChange={(e) =>
                        setEditData({ ...editData, bio: e.target.value })
                      }
                    />
                    <label className="block text-gray-700">Profile Picture</label>
                    <input type="file" onChange={handleAvatarChange} />
                  </div>
                  <div className="mt-3 flex gap-3">
                    <button
                      onClick={handleSave}
                      className="px-5 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-5 py-2 rounded-lg bg-gray-300 text-gray-800 hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {!isEditing && (
              <p className="mt-4 text-gray-700 text-lg max-w-xl">{user.bio}</p>
            )}

            {/* Stats */}
            <div className="flex space-x-12 mt-8 text-center text-gray-700">
              {[
                { label: "Followers", value: user.followers, color: "text-red-600" },
                { label: "Following", value: user.following, color: "text-yellow-600" },
                { label: "Issues", value: user.issues, color: "text-blue-600" },
              ].map((item, idx) => (
                <div key={idx}>
                  <span className={`text-2xl font-bold block ${item.color}`}>
                    {item.value}
                  </span>
                  <span className="text-sm uppercase tracking-widest">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Tabs */}
          <nav className="border-t border-gray-200 bg-gray-50">
            <div className="flex justify-around max-w-4xl mx-auto">
              {["issues", "following", "followers"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-grow py-4 text-center font-semibold text-sm transition-colors duration-300 ${
                    activeTab === tab
                      ? "border-b-4 border-red-500 text-red-600"
                      : "text-gray-600 hover:text-red-600"
                  }`}
                >
                  {tab === "issues" && "Reported Issues"}
                  {tab === "following" && "Following"}
                  {tab === "followers" && "Followers"}
                </button>
              ))}
            </div>
          </nav>

          {/* Tab Content */}
          <section className="p-6 bg-white">
            {activeTab === "issues" && (
              <div>
                <h3 className="text-xl font-semibold mb-6 text-gray-800">
                  Reported Issues
                </h3>
                <div className="space-y-4">
                  {loading ? (
                    <p className="animate-pulse text-gray-500">
                      Loading issues...
                    </p>
                  ) : user.issuesList?.length > 0 ? (
                    user.issuesList.map((issue, idx) => (
                      <div
                        key={idx}
                        className="border rounded-lg p-6 shadow hover:shadow-lg transition-shadow"
                      >
                        <h4 className="font-semibold text-lg text-red-600">
                          {issue.title}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {issue.description}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p>No issues reported yet.</p>
                  )}
                </div>
              </div>
            )}
            {activeTab === "following" && (
              <p className="text-gray-600">Following list will be here.</p>
            )}
            {activeTab === "followers" && (
              <p className="text-gray-600">Followers list will be here.</p>
            )}
          </section>
        </section>
      </main>
    </div>
  );
}
