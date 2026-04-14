import { useEffect, useState } from "react";
import {
  healthResponseSchema,
  type HealthResponse,
} from "@aereth/shared";

type FetchState =
  | {
      status: "loading";
      data: HealthResponse | null;
      error: null;
    }
  | {
      status: "ready";
      data: HealthResponse;
      error: null;
    }
  | {
      status: "error";
      data: HealthResponse | null;
      error: string;
    };

export function App() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [state, setState] = useState<FetchState>({
    status: "loading",
    data: null,
    error: null,
  });

  useEffect(() => {
    const controller = new AbortController();

    const load = async () => {
      setState((current) =>
        current.status === "ready"
          ? { status: "loading", data: current.data, error: null }
          : { status: "loading", data: null, error: null },
      );

      try {
        const response = await fetch("/api/health", {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`API responded with ${response.status}`);
        }

        const payload = healthResponseSchema.parse(await response.json());

        setState({
          status: "ready",
          data: payload,
          error: null,
        });
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        setState({
          status: "error",
          data: null,
          error: error instanceof Error ? error.message : "Unexpected error",
        });
      }
    };

    void load();

    return () => controller.abort();
  }, [refreshKey]);

  const data = state.status === "ready" ? state.data : null;
  const statusLabel =
    state.status === "ready"
      ? "Connected"
      : state.status === "error"
        ? "Offline"
        : "Connecting";

  return (
    <main className="page">
      <section className="hero">
        <p className="eyebrow">Aereth monorepo scaffold</p>
        <h1>React + Vite on top of Express, with shared Zod contracts.</h1>
        <p className="lede">
          The frontend and backend stay separate, but they meet through a real REST JSON endpoint
          and the shared package keeps the payload shape honest.
        </p>
        <div className="actions">
          <button
            type="button"
            onClick={() => setRefreshKey((value) => value + 1)}
          >
            Refresh status
          </button>
          <span className={`badge badge-${state.status}`}>{statusLabel}</span>
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <span>API endpoint</span>
          <code>/api/health</code>
        </div>

        {state.status === "error" ? (
          <p className="error">{state.error}</p>
        ) : data ? (
          <dl className="details">
            <div>
              <dt>Status</dt>
              <dd>{data.status}</dd>
            </div>
            <div>
              <dt>Service</dt>
              <dd>{data.service}</dd>
            </div>
            <div>
              <dt>Message</dt>
              <dd>{data.message}</dd>
            </div>
            <div>
              <dt>Last seen</dt>
              <dd>{new Date(data.timestamp).toLocaleString()}</dd>
            </div>
          </dl>
        ) : (
          <p className="muted">Waiting for the backend response...</p>
        )}
      </section>
    </main>
  );
}

