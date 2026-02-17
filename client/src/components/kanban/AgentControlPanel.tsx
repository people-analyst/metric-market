import { useState, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface AgentStatus {
  agentId: string;
  mode: string;
  running: boolean;
  activeTasks: { id: number; title: string }[];
  pendingApproval: { id: number; title: string }[];
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

  const handleAction = async (action: string, url: string, method = "POST") => {
    setActionLoading(action);
    try {
      const res = await fetch(url, { method });
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

      {(!status?.activeTasks?.length && !status?.pendingApproval?.length) && (
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
    </div>
  );
}
