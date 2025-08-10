import React from "react";

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-25 to-yellow-50 p-6 transition-all duration-700 ease-out">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Manage users, orders, and other administrative tasks.
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-xl border border-orange-100 p-8 transition-all duration-500 transform hover:shadow-2xl">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Example Card */}
            <div className="p-6 bg-gradient-to-br from-orange-100 to-amber-100 rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
              <h3 className="text-lg font-medium text-gray-800">Total Users</h3>
              <p className="text-2xl font-bold text-gray-900 mt-2">120</p>
            </div>
            {/* Add more cards as needed */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
