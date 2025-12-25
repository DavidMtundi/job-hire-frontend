import { ListJob } from "./list-job";

export default function JobsScreen() {
  return (
    <div className="w-full h-full space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-700">Find Jobs</h1>
        <p className="text-sm sm:text-base text-gray-600">
          Find the perfect job for you
        </p>
      </div>
      <ListJob />
    </div>
  );
}
