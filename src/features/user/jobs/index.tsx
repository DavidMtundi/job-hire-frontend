import { ListJob } from "./list-job";

export default function JobsScreen() {
  return (
    <div className="space-y-6 p-3">
      <div>
        <h1 className="text-xl font-bold text-gray-700">Find Jobs</h1>
        <p className="text-gray-600">
          Find the perfect job for you
        </p>
      </div>
      <ListJob />
    </div>
  );
}
