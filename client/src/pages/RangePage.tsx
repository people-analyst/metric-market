import { RangeInputFilter } from "@/components/RangeInputFilter";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export function RangePage() {
  const { toast } = useToast();

  return (
    <div className="p-5" data-testid="page-range">
      <Card>
        <CardContent className="p-4 space-y-4">
          <h2 className="text-sm font-semibold text-[#232a31]" data-testid="text-range-title">
            Range Input Filters
          </h2>
          <div className="space-y-3">
            <RangeInputFilter
              label="Years of Consecutive Positive EPS"
              onChange={(val) =>
                toast({
                  title: "Range Changed",
                  description: `${val.condition}: ${val.value}`,
                })
              }
            />
            <RangeInputFilter
              label="Gross Profit Margin %"
              defaultCondition="Less than"
              onChange={(val) =>
                toast({
                  title: "Range Changed",
                  description: `${val.condition}: ${val.value}`,
                })
              }
            />
            <RangeInputFilter
              label="Est. EPS Growth (%)"
              conditions={["Greater than", "Less than", "Equal to", "Between", "Not equal to"]}
              onChange={(val) =>
                toast({
                  title: "Range Changed",
                  description: `${val.condition}: ${val.value}`,
                })
              }
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
