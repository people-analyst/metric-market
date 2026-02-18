import { useState, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface PendingReviewItem {
  id: number;
  filesChanged: number;
  testResults: number;
  allTestsPassed: boolean;
}

interface ReviewReport {
  cardId: number;
  cardTitle: string;
  iterations: number;
  filesChanged: Record<string, number | { action: string; size?: number; oldSnippet?: string; newSnippet?: string }>;
  changeLog: string[];
  testResults: { command: string; passed: boolean; output: string; exitCode?: number }[];
  allTestsPassed: boolean;
  summary: string;
  budgetExhausted?: boolean;
  failureReason?: string | null;
  failedOperations?: string[];
  hadChanges?: boolean;
}

interface AgentStatus {
  agentId: string;
  mode: string;
  running: boolean;
  model?: string;
  maxIterations?: number;
  dailyBudgetPaused?: boolean;
  activeTasks: { id: number; title: string }[];
  pendingApproval: { id: number; title: string }[];
  pendingReview: PendingReviewItem[];
}

interface ActivityEntry {
  timestamp: string;
  type: "info" | "success" | "error" | "warn";
  message: string;
}

export function AgentControlPanel() {
  const [status, setStatus] = useState<AgentStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState("");
  const [activity, setActivity] = useState<ActivityEntry[]>([]);
  const [hubConnected, setHubConnected] = useState<boolean | null>(null);
  const [reviewReport, setReviewReport] = useState<ReviewReport | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);

  const addActivity = useCallback((type: ActivityEntry["type"], message: string) => {
    setActivity(prev => [{
      timestamp: new Date().toLocaleTimeString(),
      type,
      message
    }, ...prev].slice(0, 50));
  }, []);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/agent/status");
      if (!res.ok) {
        setConnectionError(`Agent API returned ${res.status}`);
        setHubConnected(false);
        return;
      }
      const data = await res.json();
      setStatus(data);
      setConnectionError(null);
      setHubConnected(true);
    } catch (err: any) {
      setConnectionError(err.message || "Cannot reach agent API");
      setHubConnected(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  const handleAction = async (action: string, url: string, method = "POST", body?: any) => {
    setActionLoading(action);
    try {
      const opts: RequestInit = { method };
      if (body) {
        opts.headers = { "Content-Type": "application/json" };
        opts.body = JSON.stringify(body);
      }
      const res = await fetch(url, opts);
      if (res.ok) {
        addActivity("success", `Action '${action}' completed`);
      } else {
        const errData = await res.json().catch(() => ({}));
        addActivity("error", `Action '${action}' failed: ${errData.error || res.status}`);
      }
      await fetchStatus();
    } catch (err: any) {
      addActivity("error", `Action '${action}' error: ${err.message}`);
    } finally {
      setActionLoading("");
    }
  };

  const handleStart = () => handleAction("start", "/api/agent/start");
  const handleStop = () => handleAction("stop", "/api/agent/stop");
  const handleApprove = (cardId: number) => handleAction(`approve-${cardId}`, `/api/agent/approve/${cardId}`);
  const handleReject = (cardId: number) => handleAction(`reject-${cardId}`, `/api/agent/reject/${cardId}`);

  const handleViewReview = async (cardId: number) => {
    try {
      const res = await fetch(`/api/agent/review/${cardId}`);
      if (!res.ok) {
        addActivity("error", `Could not load review for #${cardId}`);
        return;
      }
      const report = await res.json();
      setReviewReport(report);
      setReviewDialogOpen(true);
    } catch (err: any) {
      addActivity("error", `Error loading review: ${err.message}`);
    }
  };

  const handleConfirmReview = async (cardId: number) => {
    await handleAction(`confirm-${cardId}`, `/api/agent/confirm/${cardId}`);
    setReviewDialogOpen(false);
    setReviewReport(null);
  };

  const handleRejectReview = async (cardId: number) => {
    await handleAction(`reject-review-${cardId}`, `/api/agent/reject-review/${cardId}`, "POST", { reason: "Rejected via UI" });
    setReviewDialogOpen(false);
    setReviewReport(null);
  };

  const handleModeSwitch = async () => {
    const newMode = status?.mode === "auto" ? "semi" : "auto";
    setActionLoading("mode");
    try {
      const res = await fetch("/api/agent/mode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: newMode })
      });
      if (res.ok) addActivity("info", `Mode switched to ${newMode}`);
      await fetchStatus();
    } catch {} finally { setActionLoading(""); }
  };

  const ACTIVITY_COLORS: Record<string, string> = {
    info: "text-blue-600 dark:text-blue-400",
    success: "text-green-600 dark:text-green-400",
    error: "text-red-600 dark:text-red-400",
    warn: "text-yellow-600 dark:text-yellow-400",
  };

  if (loading) {
    return (
      <div className="p-4 space-y-3" data-testid="agent-panel-loading">
        <div className="h-5 w-20 bg-muted rounded animate-pulse" />
        <div className="h-8 w-full bg-muted rounded animate-pulse" />
        <div className="h-8 w-full bg-muted rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4" data-testid="agent-control-panel">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-semibold text-sm">AI Agent</h3>
        <div className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${
            hubConnected === null ? "bg-muted-foreground" :
            hubConnected ? "bg-green-500" : "bg-red-500"
          }`} data-testid="hub-connection-indicator" />
          <span className="text-[10px] text-muted-foreground">
            {hubConnected === null ? "..." : hubConnected ? "Connected" : "Disconnected"}
          </span>
        </div>
      </div>

      {connectionError && (
        <div className="p-2 rounded-md bg-red-500/10 border border-red-500/20" data-testid="agent-connection-error">
          <p className="text-xs text-red-600 dark:text-red-400">{connectionError}</p>
          <Button size="sm" variant="outline" onClick={fetchStatus} className="mt-1" data-testid="button-retry-connection">
            Retry
          </Button>
        </div>
      )}

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Badge variant={status?.running ? "default" : "secondary"} data-testid="agent-status-badge">
            {status?.running ? "Running" : "Stopped"}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={handleModeSwitch}
            disabled={actionLoading === "mode"}
            data-testid="button-mode-switch"
          >
            {status?.mode === "auto" ? "Auto" : "Semi"} Mode
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {!status?.running ? (
          <Button onClick={handleStart} disabled={actionLoading === "start"} size="sm" data-testid="button-agent-start">
            {actionLoading === "start" ? "Starting..." : "Start Agent"}
          </Button>
        ) : (
          <Button onClick={handleStop} disabled={actionLoading === "stop"} variant="outline" size="sm" data-testid="button-agent-stop">
            {actionLoading === "stop" ? "Stopping..." : "Stop Agent"}
          </Button>
        )}
        <span className="text-[10px] text-muted-foreground truncate">{status?.agentId}</span>
      </div>

      {status && (
        <div className="flex items-center gap-2 flex-wrap text-[10px] text-muted-foreground">
          {status.model && <span data-testid="agent-model">Model: {status.model}</span>}
          {status.maxIterations && <span>Budget: {status.maxIterations} rounds</span>}
          {status.dailyBudgetPaused && (
            <Badge variant="destructive" className="text-[10px]" data-testid="agent-budget-paused">Budget Paused</Badge>
          )}
        </div>
      )}

      {status?.activeTasks && status.activeTasks.length > 0 && (
        <div data-testid="agent-active-tasks">
          <h4 className="text-xs font-medium mb-1.5 text-muted-foreground uppercase tracking-wide">Active Tasks</h4>
          <div className="space-y-1">
            {status.activeTasks.map(task => (
              <div key={task.id} className="flex items-center gap-2 text-sm p-2 rounded-md bg-muted/50">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse flex-shrink-0" />
                <span className="truncate flex-1">#{task.id} {task.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {status?.pendingApproval && status.pendingApproval.length > 0 && (
        <div data-testid="agent-pending-approvals">
          <h4 className="text-xs font-medium mb-1.5 text-muted-foreground uppercase tracking-wide">
            Pending Approval
            <Badge variant="secondary" className="ml-1.5 text-[10px]">{status.pendingApproval.length}</Badge>
          </h4>
          <div className="space-y-1">
            {status.pendingApproval.map(task => (
              <div key={task.id} className="flex items-center justify-between gap-2 text-sm p-2 rounded-md bg-muted/50">
                <span className="truncate flex-1 text-xs">#{task.id} {task.title}</span>
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    onClick={() => handleApprove(task.id)}
                    disabled={actionLoading === `approve-${task.id}`}
                    data-testid={`button-approve-${task.id}`}
                  >
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleReject(task.id)}
                    disabled={actionLoading === `reject-${task.id}`}
                    data-testid={`button-reject-${task.id}`}
                  >
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {status?.pendingReview && status.pendingReview.length > 0 && (
        <div data-testid="agent-pending-reviews">
          <h4 className="text-xs font-medium mb-1.5 text-muted-foreground uppercase tracking-wide">
            Pending Review
            <Badge variant="secondary" className="ml-1.5 text-[10px]">{status.pendingReview.length}</Badge>
          </h4>
          <div className="space-y-1">
            {status.pendingReview.map(item => (
              <div key={item.id} className="flex items-center justify-between gap-2 text-sm p-2 rounded-md bg-muted/50">
                <div className="flex-1 min-w-0">
                  <span className="text-xs truncate block">#{item.id}</span>
                  <span className="text-[10px] text-muted-foreground">
                    {item.filesChanged} files | {item.testResults} tests |
                    <span className={item.allTestsPassed ? " text-green-600 dark:text-green-400" : " text-red-600 dark:text-red-400"}>
                      {item.allTestsPassed ? " Passed" : " Failed"}
                    </span>
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleViewReview(item.id)}
                  data-testid={`button-view-review-${item.id}`}
                >
                  Review
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {(!status?.activeTasks?.length && !status?.pendingApproval?.length && !status?.pendingReview?.length) && (
        <p className="text-xs text-muted-foreground py-2" data-testid="agent-idle-message">
          {status?.running
            ? "Agent is polling for available tasks..."
            : "Start the agent to begin processing kanban cards with AI."}
        </p>
      )}

      {activity.length > 0 && (
        <div data-testid="agent-activity-log">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Activity</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActivity([])}
              data-testid="button-clear-activity"
            >
              Clear
            </Button>
          </div>
          <div className="space-y-0.5 max-h-40 overflow-y-auto">
            {activity.map((entry, i) => (
              <div key={i} className="flex items-start gap-1.5 text-[11px]">
                <span className="text-muted-foreground flex-shrink-0">{entry.timestamp}</span>
                <span className={`flex-1 ${ACTIVITY_COLORS[entry.type] || ""}`}>{entry.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        {reviewReport && (
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" data-testid="dialog-review-report">
            <DialogHeader>
              <DialogTitle className="text-sm">Agent Review: #{reviewReport.cardId} {reviewReport.cardTitle}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline">{reviewReport.iterations} iterations</Badge>
                <Badge variant="outline">{Object.keys(reviewReport.filesChanged).length} files changed</Badge>
                <Badge variant={reviewReport.allTestsPassed ? "default" : "destructive"}>
                  {reviewReport.allTestsPassed ? "Tests Passed" : "Tests Failed"}
                </Badge>
              </div>

              <div className="space-y-1">
                <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Summary</h4>
                <p className="text-xs whitespace-pre-wrap bg-muted/50 p-3 rounded-md">{reviewReport.summary}</p>
              </div>

              {Object.keys(reviewReport.filesChanged).length > 0 && (
                <div className="space-y-1">
                  <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Files Changed</h4>
                  <div className="space-y-0.5">
                    {Object.entries(reviewReport.filesChanged).map(([file, info]) => (
                      <div key={file} className="flex items-center justify-between gap-2 text-xs p-1.5 rounded bg-muted/30">
                        <span className="font-mono truncate flex-1">{file}</span>
                        <Badge variant="outline" className="text-[10px]">
                          {typeof info === "number" ? `${info} edit${info > 1 ? "s" : ""}` : info.action}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {reviewReport.budgetExhausted && (
                <div className="p-2 rounded-md bg-yellow-500/10 border border-yellow-500/20">
                  <p className="text-xs text-yellow-700 dark:text-yellow-400">
                    Agent paused at budget limit ({reviewReport.iterations} iterations).
                    {reviewReport.failureReason && ` Reason: ${reviewReport.failureReason}`}
                    {(reviewReport.failedOperations?.length ?? 0) > 0 && ` (${reviewReport.failedOperations!.length} failed operations)`}
                  </p>
                </div>
              )}

              {reviewReport.changeLog.length > 0 && (
                <div className="space-y-1">
                  <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Change Log</h4>
                  <div className="text-xs space-y-0.5 max-h-32 overflow-y-auto bg-muted/30 p-2 rounded-md">
                    {reviewReport.changeLog.map((entry, i) => (
                      <div key={i} className="font-mono">{entry}</div>
                    ))}
                  </div>
                </div>
              )}

              {reviewReport.testResults.length > 0 && (
                <div className="space-y-1">
                  <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Test Results</h4>
                  <div className="space-y-1">
                    {reviewReport.testResults.map((test, i) => (
                      <div key={i} className="p-2 rounded-md bg-muted/30 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${test.passed ? "bg-green-500" : "bg-red-500"}`} />
                          <span className="text-xs font-mono">{test.command}</span>
                        </div>
                        {test.output && (
                          <pre className="text-[10px] text-muted-foreground overflow-x-auto max-h-20 overflow-y-auto">{test.output}</pre>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRejectReview(reviewReport.cardId)}
                  disabled={actionLoading.startsWith("reject-review")}
                  data-testid="button-reject-review"
                >
                  Reject Changes
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleConfirmReview(reviewReport.cardId)}
                  disabled={actionLoading.startsWith("confirm")}
                  data-testid="button-confirm-review"
                >
                  Confirm & Complete
                </Button>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
