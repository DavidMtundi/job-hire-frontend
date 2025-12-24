import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs"
import DepartmentsScreen from "./department"
import CategoryScreen from "./job-category"

export default function SettingsScreen() {
  return (
    <div className="w-full">
      <Tabs defaultValue="departments">
        <TabsList className="w-full h-11 rounded-full">
          <TabsTrigger value="departments" className="rounded-full">Departments</TabsTrigger>
          <TabsTrigger value="categories" className="rounded-full">Job Categories</TabsTrigger>
        </TabsList>
        <TabsContent value="departments" className="mt-4">
          <DepartmentsScreen />
        </TabsContent>
        <TabsContent value="categories" className="mt-4">
          <CategoryScreen />
        </TabsContent>
      </Tabs>
    </div>
  )
}
