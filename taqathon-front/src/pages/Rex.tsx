import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BookOpen,
  Brain,
  Lightbulb,
  FileText,
  Calendar,
  Users,
  TrendingUp,
  Download,
  Plus,
  Eye,
  Edit,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  Zap,
  Archive,
  Star,
  Award,
  BarChart3,
  Upload,
  Paperclip,
  File,
} from "lucide-react";
import { useMaintenanceStore } from "@/(zustand)/useMaintenanceStore";
import { useAnomalyStore } from "@/(zustand)/useAnomalyStore";
import {
  ReturnOfExperience,
  Anomaly,
  MaintenanceWindow,
} from "@/types/anomaly";
import { toast } from "sonner";
import { format } from "date-fns";
import apiClient from "@/lib/api";

interface RexFile {
  id: number;
  description: string;
  rexFilePath: string;
  fileName: string;
  createdAt: string;
  updatedAt: string;
  anomaly?: {
    id: number;
    description: string;
    equipment: string;
    equipementDescription: string;
    service: string;
    system: string;
    status: string;
    criticality: number;
    processSafety: number;
    integrity: number;
    disponibility: number;
    detectionDate: string;
    sysShutDownRequired: boolean;
  };
}

// Simplified RexCard component - only shows anomaly name and download button
const RexCard = ({
  file,
  onDownload,
}: {
  file: RexFile;
  onDownload: (file: RexFile) => void;
}) => {
  return (
    <Card className="group border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
      {/* Header with gradient accent */}
      <div className="h-2 bg-[#003D55]"></div>

      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-blue-100 text-blue-800 border-blue-200 font-medium">
                REX-{file.id}
              </Badge>
              <Badge
                variant="outline"
                className="text-xs bg-purple-50 border-purple-200 text-purple-700"
              >
                <File className="h-3 w-3 mr-1" />
                {file.fileName}
              </Badge>
            </div>
            
            {/* Anomaly Information */}
            {file.anomaly ? (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {file.anomaly.equipementDescription || file.anomaly.equipment}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {file.anomaly.description}
                </p>
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                  <span>Service: {file.anomaly.service}</span>
                  <span>•</span>
                  <span>Status: {file.anomaly.status}</span>
                  <span>•</span>
                  <span>Created: {format(new Date(file.createdAt), "MMM dd, yyyy")}</span>
                </div>
              </div>
            ) : (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {file.description}
                </h3>
                <p className="text-sm text-gray-600">
                  Created: {format(new Date(file.createdAt), "MMM dd, yyyy")}
                </p>
              </div>
            )}
          </div>

          {/* Download Button */}
          <div className="ml-4">
            <Button
              onClick={() => onDownload(file)}
              variant="outline"
              size="sm"
              className="border-[#003D55] text-[#003D55] hover:bg-[#003D55] hover:text-white transition-colors"
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const Rex = () => {
  const [rexFiles, setRexFiles] = useState<RexFile[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalFiles, setTotalFiles] = useState(0);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);

  const { maintenanceWindows, getMaintenanceWindows } = useMaintenanceStore();
  const { getAnomalies } = useAnomalyStore();

  useEffect(() => {
    getMaintenanceWindows();
    getAnomalies();
  }, []);

  useEffect(() => {
    fetchRexFiles();
  }, [page, limit]);

  const fetchRexFiles = async () => {
    setIsLoadingFiles(true);
    try {
      const response = await apiClient.get("/attachements/rex", {
        params: {
          page,
          limit,
        },
      });

      if (response.data.success) {
        setRexFiles(response.data.data);
        setTotalFiles(response.data.total || response.data.data.length);
      }
    } catch (error) {
      console.error("Failed to fetch REX files:", error);
      toast.error("Failed to load REX records");
    } finally {
      setIsLoadingFiles(false);
    }
  };

  const handleDownload = async (file: RexFile) => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        toast.error("Authentication token not found. Please log in again.");
        return;
      }

      // Create download URL and trigger download
      const downloadUrl = `${import.meta.env.VITE_BACKEND_URL || ''}/attachements/rex/${file.id}`;
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = file.fileName;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success(`Downloading ${file.fileName}`);
    } catch (error) {
      console.error("Failed to download file:", error);
      toast.error("Failed to download file");
    }
  };

  const filteredRexFiles = rexFiles.filter((file) => {
    const matchesSearch =
      file.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.anomaly?.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.anomaly?.equipementDescription?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const completedWindows = maintenanceWindows.filter(
    (window) =>
      window.status === "completed" ||
      new Date(window.scheduleEnd) < new Date(),
  );

  return (
    <div className="min-h-screen">
      <div className="w-full px-4 py-8 space-y-8">
        {/* Modern Header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[#003D55] rounded-3xl"></div>
          <div className="relative p-8 lg:p-12">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative">
                    <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl border border-white/20">
                      <Brain className="h-8 w-8 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                      <Lightbulb className="h-3 w-3 text-yellow-900" />
                    </div>
                  </div>
                  <div>
                    <div className="text-white/90 text-sm font-medium uppercase tracking-wider">
                      Knowledge Management
                    </div>
                    <h1 className="text-3xl lg:text-4xl font-bold text-white mt-1">
                      Return of Experience
                    </h1>
                  </div>
                </div>
                <p className="text-white/80 text-lg max-w-2xl leading-relaxed">
                  Transform maintenance insights into actionable knowledge.
                  Capture lessons learned, analyze root causes, and build a
                  comprehensive knowledge base for continuous improvement.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <Button
                  variant="secondary"
                  onClick={() => fetchRexFiles()}
                  disabled={isLoadingFiles}
                  className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30 transition-all duration-300"
                >
                  {isLoadingFiles ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  Refresh Data
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search REX files by description, filename, or anomaly..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <Badge variant="outline" className="px-3 py-1">
                {filteredRexFiles.length} records
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* REX Files List */}
        <div className="space-y-4">
          {isLoadingFiles ? (
            <Card>
              <CardContent className="text-center py-16">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading REX records...</p>
              </CardContent>
            </Card>
          ) : filteredRexFiles.length > 0 ? (
            <>
              {filteredRexFiles.map((file) => (
                <RexCard
                  key={file.id}
                  file={file}
                  onDownload={handleDownload}
                />
              ))}

              {/* Pagination Controls */}
              {totalFiles > limit && (
                <Card>
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        Showing {(page - 1) * limit + 1} to{" "}
                        {Math.min(page * limit, totalFiles)} of {totalFiles}{" "}
                        records
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPage(Math.max(1, page - 1))}
                          disabled={page === 1}
                        >
                          Previous
                        </Button>
                        <span className="text-sm text-gray-600">
                          Page {page} of {Math.ceil(totalFiles / limit)}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPage(page + 1)}
                          disabled={page >= Math.ceil(totalFiles / limit)}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="text-center py-16">
                <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  No REX Records Found
                </h3>
                <p className="text-gray-600 mb-6">
                  {rexFiles.length === 0
                    ? "Start documenting maintenance experiences to build your knowledge base"
                    : "No records match your search criteria"}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Rex;
