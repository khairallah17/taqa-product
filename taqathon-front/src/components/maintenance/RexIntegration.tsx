import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Brain,
  FileText,
  AlertTriangle,
  CheckCircle,
  Target,
  Lightbulb,
  Star,
  Clock,
  Users,
  BookOpen,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  MaintenanceWindow,
  ReturnOfExperience,
  Anomaly,
} from "@/types/anomaly";
import { useMaintenanceTranslations } from "@/i18n/hooks/useTranslations";

interface RexIntegrationProps {
  maintenanceWindow: MaintenanceWindow;
  isCompleted?: boolean;
  onRexCreated?: (rex: ReturnOfExperience) => void;
}

interface QuickRexFormData {
  summary: string;
  rootCause: string;
  correctionAction: string;
  preventiveAction: string;
  lessonsLearned: string;
  recommendations: string;
  impact: "low" | "medium" | "high" | "critical";
  category:
    | "technical"
    | "procedural"
    | "organizational"
    | "safety"
    | "quality";
}

const QuickRexDialog = ({
  maintenanceWindow,
  onRexCreated,
}: {
  maintenanceWindow: MaintenanceWindow;
  onRexCreated?: (rex: ReturnOfExperience) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const maintenanceT = useMaintenanceTranslations();

  const [formData, setFormData] = useState<QuickRexFormData>({
    summary: "",
    rootCause: "",
    correctionAction: "",
    preventiveAction: "",
    lessonsLearned: "",
    recommendations: "",
    impact: "medium",
    category: "technical",
  });

  const resolvedAnomalies =
    maintenanceWindow.anomalies?.filter(
      (a) => a.status === "CLOSED" || a.status === "TREATED",
    ) || [];

  const handleSubmit = async () => {
    if (!formData.summary || !formData.rootCause) {
      toast.error(maintenanceT.pleaseFillinSummaryAndRootCause);
      return;
    }

    setIsSubmitting(true);
    try {
      const newRex: ReturnOfExperience = {
        id: `rex_${Date.now()}`,
        summary: formData.summary,
        rootCause: formData.rootCause,
        correctionAction: formData.correctionAction,
        preventiveAction: formData.preventiveAction,
        lessonsLearned: formData.lessonsLearned,
        recommendations: formData.recommendations,
        attachments: [],
        createdBy: "Current User", // In real app, get from auth
        createdAt: new Date(),
      };

      // In a real application, this would be an API call
      onRexCreated?.(newRex);
      toast.success(maintenanceT.rexCreatedSuccessfully);
      setIsOpen(false);

      // Reset form
      setFormData({
        summary: "",
        rootCause: "",
        correctionAction: "",
        preventiveAction: "",
        lessonsLearned: "",
        recommendations: "",
        impact: "medium",
        category: "technical",
      });
    } catch (error) {
      toast.error(maintenanceT.failedToCreateRex);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateFullRex = () => {
    navigate("/rex?source=maintenance&windowId=" + maintenanceWindow.id);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-full bg-blue-50 hover:bg-blue-100 border-blue-200"
        >
          <Brain className="h-4 w-4 mr-2" />
          {maintenanceT.createRexRecord}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-600" />
            {maintenanceT.quickRexCreation}
          </DialogTitle>
          <DialogDescription>
            {maintenanceT.documentKeyLearnings} {maintenanceWindow.title}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Maintenance Context */}
          <Card className="bg-gray-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {maintenanceT.maintenanceContext}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{maintenanceT.window}</span>
                <span className="font-medium">{maintenanceWindow.title}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{maintenanceT.period}</span>
                <span>
                  {format(new Date(maintenanceWindow.scheduleStart), "MMM dd")}{" "}
                  -{" "}
                  {format(
                    new Date(maintenanceWindow.scheduleEnd),
                    "MMM dd, yyyy",
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{maintenanceT.anomaliesResolved}</span>
                <Badge variant="secondary">{resolvedAnomalies.length}</Badge>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            {/* Impact Level */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">{maintenanceT.impactLevel}</Label>
              <Select
                value={formData.impact}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    impact: value as QuickRexFormData["impact"],
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={maintenanceT.impactLevel} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">{maintenanceT.lowImpact}</SelectItem>
                  <SelectItem value="medium">{maintenanceT.mediumImpact}</SelectItem>
                  <SelectItem value="high">{maintenanceT.highImpact}</SelectItem>
                  <SelectItem value="critical">{maintenanceT.criticalImpact}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">{maintenanceT.category}</Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    category: value as QuickRexFormData["category"],
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={maintenanceT.category} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="technical">{maintenanceT.technical}</SelectItem>
                  <SelectItem value="procedural">{maintenanceT.procedural}</SelectItem>
                  <SelectItem value="organizational">{maintenanceT.organizational}</SelectItem>
                  <SelectItem value="safety">{maintenanceT.safety}</SelectItem>
                  <SelectItem value="quality">{maintenanceT.quality}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Executive Summary */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">{maintenanceT.executiveSummary}</Label>
            <Textarea
              placeholder={maintenanceT.briefOverviewPlaceholder}
              value={formData.summary}
              onChange={(e) =>
                setFormData({ ...formData, summary: e.target.value })
              }
              className="min-h-[100px]"
            />
          </div>

          {/* Root Cause Analysis */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">{maintenanceT.rootCauseAnalysis}</Label>
            <Textarea
              placeholder={maintenanceT.rootCausePlaceholder}
              value={formData.rootCause}
              onChange={(e) =>
                setFormData({ ...formData, rootCause: e.target.value })
              }
              className="min-h-[100px]"
            />
          </div>

          {/* Actions Taken */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">{maintenanceT.actionsTaken}</Label>
            <Textarea
              placeholder={maintenanceT.correctiveActionsPlaceholder}
              value={formData.correctionAction}
              onChange={(e) =>
                setFormData({ ...formData, correctionAction: e.target.value })
              }
              className="min-h-[80px]"
            />
          </div>

          {/* Key Lessons Learned */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">{maintenanceT.keyLessonsLearned}</Label>
            <Textarea
              placeholder={maintenanceT.lessonsLearnedPlaceholder}
              value={formData.lessonsLearned}
              onChange={(e) =>
                setFormData({ ...formData, lessonsLearned: e.target.value })
              }
              className="min-h-[80px]"
            />
          </div>
        </div>

        <DialogFooter className="space-x-2">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            {maintenanceT.cancel}
          </Button>
          <Button
            variant="outline"
            onClick={handleCreateFullRex}
            className="bg-blue-50 hover:bg-blue-100"
          >
            <FileText className="h-4 w-4 mr-2" />
            {maintenanceT.createFullRex}
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                {maintenanceT.creating}
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                {maintenanceT.createQuickRex}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const RexSummaryCard = ({
  rexCount,
  lastRexDate,
}: {
  rexCount: number;
  lastRexDate?: Date;
}) => {
  const maintenanceT = useMaintenanceTranslations();
  
  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2 text-blue-700">
          <BookOpen className="h-4 w-4" />
          {maintenanceT.knowledgeCapture}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">{maintenanceT.rexRecords}</span>
          <Badge variant="secondary" className="bg-blue-100 text-blue-700">
            {rexCount}
          </Badge>
        </div>
        {lastRexDate && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">{maintenanceT.lastRex}</span>
            <span className="text-sm font-medium">
              {format(lastRexDate, "MMM dd, yyyy")}
            </span>
          </div>
        )}
        <div className="flex gap-2 pt-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-blue-600 hover:bg-blue-100 p-1 h-auto"
          >
            {maintenanceT.viewAllRex}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const RexOpportunityBanner = ({
  maintenanceWindow,
}: {
  maintenanceWindow: MaintenanceWindow;
}) => {
  const maintenanceT = useMaintenanceTranslations();
  const count = maintenanceWindow.anomalies?.length || 0;
  
  return (
    <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-amber-100 rounded-lg">
            <Lightbulb className="h-5 w-5 text-amber-600" />
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-amber-800 mb-1">
              {maintenanceT.rexOpportunityIdentified}
            </h4>
            <p className="text-sm text-amber-700 mb-3">
              {maintenanceT.rexOpportunityBanner.replace('{{count}}', count.toString())}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const RexIntegration = ({
  maintenanceWindow,
  isCompleted = false,
  onRexCreated,
}: RexIntegrationProps) => {
  const maintenanceT = useMaintenanceTranslations();
  
  // Mock data - in real app, fetch from REX store/API
  const existingRex = 0; // Number of existing REX records for this window
  const lastRexDate = undefined; // Date of last REX record

  return (
    <div className="space-y-4">
      {/* Main REX Card */}
      <Card className="hover-lift modern-shadow-lg bg-gradient-to-br from-background to-blue-50/20 border-blue-200/50">
        <CardHeader className="pb-4">
          <CardTitle className="font-heading text-lg flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-600" />
            {maintenanceT.rex}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Show opportunity banner if completed and has anomalies */}
          {isCompleted && maintenanceWindow.anomalies?.length > 0 && (
            <RexOpportunityBanner maintenanceWindow={maintenanceWindow} />
          )}

          {/* REX Summary */}
          <RexSummaryCard rexCount={existingRex} lastRexDate={lastRexDate} />

          {/* Quick REX Creation */}
          <QuickRexDialog
            maintenanceWindow={maintenanceWindow}
            onRexCreated={onRexCreated}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default RexIntegration;
