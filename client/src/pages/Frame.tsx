import { ChevronDownIcon, PlusIcon, XIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

const filterData = [
  {
    id: "region",
    label: "Region is",
    type: "badge",
    selected: ["United States"],
    hasRemove: true,
  },
  {
    id: "marketCap",
    label: "Market Cap (Intraday) is",
    type: "toggle",
    options: ["Small Cap", "Mid Cap", "Large Cap", "Mega Cap"],
    selected: [],
    hasRemove: true,
  },
  {
    id: "sector",
    label: "Sector is",
    type: "badge",
    selected: ["Financial Services", "Technology"],
    hasRemove: true,
  },
  {
    id: "industry",
    label: "Industry is",
    type: "add",
    placeholder: "Industry",
    hasRemove: true,
  },
  {
    id: "revenueConsistency",
    label: "Revenue Consistency is",
    type: "toggle",
    options: ["Low", "Medium", "High"],
    selected: ["Medium"],
    hasIcon: true,
    hasRemove: true,
  },
  {
    id: "consecutiveEps",
    label: "Year of Consecutive Positive EPS",
    type: "input",
    sublabel: "Greater than",
    hasIcon: true,
    hasRemove: true,
  },
  {
    id: "uncertaintyRating",
    label: "Uncertainity rating is",
    type: "toggle",
    options: ["Low", "Medium", "High", "Very High", "Extreme"],
    selected: ["Very High"],
    hasIcon: true,
    hasRemove: true,
  },
  {
    id: "morningstarRating",
    label: "Morningstar Rating Change is",
    type: "toggle",
    options: ["Upgrade", "Downgrade"],
    selected: ["Upgrade"],
    hasIcon: true,
    hasRemove: true,
  },
  {
    id: "grossProfitMargin",
    label: "Gross Profit Margin % is",
    type: "input",
    sublabel: "Greater than",
    hasRemove: true,
  },
];

export const Frame = (): JSX.Element => {
  return (
    <div className="bg-[#f5f8fa] min-h-screen p-8 flex gap-8">
      <div className="flex-1 max-w-[1100px]">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <ChevronDownIcon className="w-6 h-6 text-[#232a31]" />
            <h1 className="[font-family:'Arial-Regular',Helvetica] font-normal text-[#232a31] text-[32px]">
              Build Stocks screener with filters below
            </h1>
          </div>
          <p className="[font-family:'Arial-Regular',Helvetica] font-normal text-[#5b636a] text-xl ml-8">
            Currency in USD
          </p>
        </div>

        <div className="space-y-3">
          {filterData.map((filter) => (
            <Card
              key={filter.id}
              className="bg-white rounded-[3px] border-0 shadow-none"
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1">
                    <span className="[font-family:'Arial-Regular',Helvetica] font-normal text-[#5b636a] text-lg whitespace-nowrap min-w-[250px]">
                      {filter.label}
                    </span>

                    {filter.type === "badge" && (
                      <div className="flex gap-2">
                        {filter.selected?.map((item, idx) => (
                          <Badge
                            key={idx}
                            variant="secondary"
                            className="bg-[#e0f0ff] text-[#232a31] hover:bg-[#e0f0ff] [font-family:'Arial-Regular',Helvetica] font-normal text-lg px-4 py-3 h-auto rounded-[3px]"
                          >
                            {item}
                            <XIcon className="w-5 h-5 ml-2" />
                          </Badge>
                        ))}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-[53px] w-[53px] rounded-[3px]"
                        >
                          <PlusIcon className="w-5 h-5" />
                        </Button>
                      </div>
                    )}

                    {filter.type === "toggle" && (
                      <ToggleGroup
                        type="multiple"
                        defaultValue={filter.selected}
                        className="border border-[#e0e4e9] rounded-[3px] h-[46px] p-0"
                      >
                        {filter.options?.map((option, idx) => (
                          <ToggleGroupItem
                            key={idx}
                            value={option}
                            className={`[font-family:'Arial-Regular',Helvetica] font-normal text-[#5b636a] text-lg px-6 h-full rounded-none border-r border-[#e0e4e9] last:border-r-0 data-[state=on]:bg-[#e0f0ff] data-[state=on]:text-[#232a31]`}
                          >
                            {option}
                          </ToggleGroupItem>
                        ))}
                      </ToggleGroup>
                    )}

                    {filter.type === "add" && (
                      <Button
                        variant="ghost"
                        className="[font-family:'Arial-Regular',Helvetica] font-normal text-[#5b636a] text-lg h-auto"
                      >
                        <PlusIcon className="w-5 h-5 mr-2" />
                        {filter.placeholder}
                      </Button>
                    )}

                    {filter.type === "input" && (
                      <div className="flex flex-col gap-1">
                        <div className="border border-[#e0e4e9] rounded-[3px] h-[46px] w-32 px-4" />
                        {filter.sublabel && (
                          <span className="[font-family:'Arial-Regular',Helvetica] font-normal text-[#0f69ff] text-lg">
                            {filter.sublabel}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {filter.hasIcon && (
                      <div className="w-6 h-6 rounded-full bg-[#6c2bd9] flex items-center justify-center">
                        <ChevronDownIcon className="w-4 h-4 text-white" />
                      </div>
                    )}
                    {filter.hasRemove && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 rounded-full text-[#5b636a]"
                      >
                        <XIcon className="w-5 h-5" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Button
          variant="ghost"
          className="mt-6 [font-family:'Arial-Regular',Helvetica] font-normal text-[#0f69ff] text-xl h-auto"
        >
          <PlusIcon className="w-6 h-6 mr-2" />
          Add another filter
        </Button>

        <div className="flex gap-4 mt-8">
          <Button className="bg-[#0f69ff] hover:bg-[#0f69ff]/90 [font-family:'Arial-Regular',Helvetica] font-normal text-white text-xl px-8 h-[52px] rounded-[3px]">
            Find Stocks
          </Button>
          <Button
            variant="outline"
            className="border-[#0f69ff] text-[#0f69ff] hover:bg-[#0f69ff]/10 [font-family:'Arial-Regular',Helvetica] font-normal text-xl px-8 h-[52px] rounded-[3px]"
          >
            Save Filters
          </Button>
        </div>
      </div>

      <div className="w-[220px]">
        <div className="border-l-[5px] border-[#e0e4e9] pl-5">
          <p className="[font-family:'Arial-Regular',Helvetica] font-normal text-[#232a31] text-xl mb-2">
            Estimated results
          </p>
          <p className="[font-family:'Arial-Regular',Helvetica] font-normal text-[#232a31] text-4xl">
            1
          </p>
        </div>
      </div>
    </div>
  );
};
