"use client";

import { Calendar, Clock, Tag } from "lucide-react";
import Image from "next/image";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Mock data for the timeline (values represent number of laps)
const timelineData = [
  {
    name: "Strategy",
    soft: 12, // First stint
    medium: 23, // Second stint
    hard: 15, // Third stint
  },
];

export default function Dashboard() {
  return (
    <div className="overflow-hidden h-[calc(100vh-5rem)] p-8">
      <div className="bg-neutral-900 rounded-xl h-full p-4 flex flex-row gap-4">
        {/* Sidebar Session Selection */}
        <div className="w-1/4 h-full bg-neutral-800 rounded-lg p-4">
          <div className="w-full h-2/12 bg-neutral-900 rounded-md p-2 flex flex-row gap-4">
            <Image
              src="/placeholder.png"
              alt="Track Logo"
              className="h-full w-2/8 rounded-md"
              width={256}
              height={256}
            />
            <div className="flex flex-col">
              <h2 className="text-white text-lg font-semibold">
                Track Name/Session Name
              </h2>
              <hr className="my-2 border-neutral-700" />
              <span className="flex flex-col">
                <div className="flex flex-row items-center text-neutral-400 text-sm">
                  <Calendar className="inline h-4 w-4 mr-2 text-neutral-400" />
                  Date
                </div>
                <div className="flex flex-row items-center text-neutral-400 text-sm">
                  <Clock className="inline h-4 w-4 mr-2 text-neutral-400" />
                  Edited on 12/12/2025
                </div>
                <div className="flex flex-row items-center text-neutral-400 text-sm">
                  <Tag className="inline h-4 w-4 mr-2 text-neutral-400" />
                  <div className="border rounded-4xl flex flex-row px-2 text-sm">
                    tag1
                  </div>
                </div>
              </span>
            </div>
          </div>
        </div>
        {/* Main Dashboard Thingy */}
        <div className="w-3/4 h-full pl-4 bg-neutral-800 rounded-lg p-4 flex flex-col gap-2">
          <h2 className="text-white font-semibold text-2xl">
            Track Name/Session Name
          </h2>
          <hr className="border-neutral-700" />

          {/* Timeline Section */}
          <div className="w-full bg-neutral-900 p-4 rounded-lg flex flex-col gap-2">
            <h3 className="text-lg font-bold">Timeline</h3>

            <div className="h-16 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={timelineData}
                  margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                >
                  {/* Hide axes for a clean look */}
                  <XAxis type="number" domain={[0, "dataMax"]} hide />
                  <YAxis type="category" dataKey="name" hide />

                  <Tooltip
                    cursor={{ fill: "transparent" }}
                    contentStyle={{
                      backgroundColor: "#171717",
                      border: "1px solid #404040",
                      borderRadius: "0.5rem",
                      color: "#fff",
                    }}
                    itemStyle={{ color: "#fff" }}
                  />

                  {/* Stacked bars create the timeline segments */}
                  {/* radius prop rounds the corners: [topLeft, topRight, bottomRight, bottomLeft] */}
                  <Bar
                    dataKey="soft"
                    stackId="a"
                    fill="#dc2626"
                    radius={[4, 0, 0, 4]}
                    name="Soft (Laps 1-12)"
                  />
                  <Bar
                    dataKey="medium"
                    stackId="a"
                    fill="#eab308"
                    name="Medium (Laps 13-35)"
                  />
                  <Bar
                    dataKey="hard"
                    stackId="a"
                    fill="#ffffff"
                    radius={[0, 4, 4, 0]}
                    name="Hard (Laps 36-50)"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="flex justify-between text-xs text-neutral-500 px-1">
              <span>Start</span>
              <span>Finish (Lap 50)</span>
            </div>
          </div>
          <div className="w-full flex flex-row h-2/5 gap-2">
            {/* tyressssssss */}
            <div className="bg-neutral-900 rounded-lg p-4 w-2/7 h-full flex flex-col gap-2">
              <div className="bg-neutral-800 rounded-md p-2 px-4 w-full h-1/4 flex flex-row items-center gap-4">
                <h3 className="text-red-600 text-2xl border-3 font-extrabold rounded-full px-2">
                  S
                </h3>
                <div className="flex flex-col">
                  <p className="text-neutral-400 text-xs">
                    No Data Yet (Click on the tyre symbol)
                  </p>
                </div>
              </div>
              <div className="bg-neutral-800 rounded-md p-2 px-4 w-full h-1/4 flex flex-row items-center gap-4">
                <h3 className="text-yellow-500 text-2xl border-3 font-extrabold rounded-full px-2">
                  M
                </h3>
                <div className="flex flex-col">
                  <p className="text-neutral-400 text-xs">
                    Average wear per lap: 4.5%
                  </p>
                  <p className="text-neutral-400 text-xs">
                    Recommended Lap Count: 7
                  </p>
                </div>
              </div>
              <div className="bg-neutral-800 rounded-md p-2 px-4 w-full h-1/4 flex flex-row items-center gap-4">
                <h3 className="text-white text-2xl border-3 font-extrabold rounded-full px-2">
                  H
                </h3>
                <div className="flex flex-col">
                  <p className="text-neutral-400 text-xs">
                    Average wear per lap: 4.5%
                  </p>
                  <p className="text-neutral-400 text-xs">
                    Recommended Lap Count: 7
                  </p>
                </div>
              </div>
              <div className="bg-neutral-800 rounded-md p-2 px-4 w-full h-1/4 flex flex-row items-center gap-4">
                <h3 className="text-blue-700 text-2xl border-3 font-extrabold rounded-full px-2">
                  W
                </h3>
                <div className="flex flex-col">
                  <p className="text-neutral-400 text-xs">
                    Average wear per lap: 4.5%
                  </p>
                  <p className="text-neutral-400 text-xs">
                    Recommended Lap Count: 7
                  </p>
                </div>
              </div>
            </div>
            {/* AI strategy overview cause i cant think of anything better */}
            <div className="bg-neutral-900 rounded-lg p-4 w-5/7 h-full flex flex-col gap-2">
              <h3 className="text-lg font-bold">AI Strategy Overview</h3>
              <p>ai text output go here</p>
            </div>
          </div>

          {/* Notes section*/}
          <div className="bg-neutral-900 rounded-lg p-4 w-2/7 h-2/5 flex flex-col gap-2">
            <h3 className="font-semibold">Notes</h3>
            <textarea
              className="w-full h-full bg-neutral-800 rounded-md p-2 text-white resize-none focus:outline-none focus:ring-2 focus:ring-neutral-600"
              placeholder="Add your notes here..."
            />
          </div>
        </div>
      </div>
    </div>
  );
}
