import { Card, CardContent } from "@/components/ui/card";

export function MenuPage() {
  return (
    <div className="p-5" data-testid="page-menu">
      <Card>
        <CardContent className="p-4">
          <p className="text-sm text-[#5b636a]" data-testid="text-menu-placeholder">
            Menu component will be added here from the Menu4 Figma design.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
