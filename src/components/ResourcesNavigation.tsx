export type ResourcesView = "models" | "tools" | "tutorials";

// Academy currently exposes courses only. Keep the shared API for archived pages.
export default function ResourcesNavigation(props: { activeView: ResourcesView }) {
  void props;
  return null;
}
