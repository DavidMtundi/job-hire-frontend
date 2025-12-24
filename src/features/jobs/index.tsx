import { ListJob } from "./list-job";

export default function JobsScreen() {

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 p-3">
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
