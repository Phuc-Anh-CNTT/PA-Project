import React, { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from './ui/table';
import { Checkbox } from './ui/checkbox';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ArrowUpDown, ArrowUp, ArrowDown, Edit2, Eye, Search, Filter, ChevronLeft, ChevronRight, GripVertical } from 'lucide-react';

// Mock data type
interface Person {
  id: string;
  name: string;
  age: number;
  school: string;
  skill: string;
  bachelors: string;
  masters: string;
  note: string;
  point1: number;
  point2: number;
  point3: number;
  summaryPoints: number;
}

// Extended mock data for pagination demonstration
const mockData: Person[] = [
  {
    id: "001",
    name: "Alexander Chen",
    age: 28,
    school: "Stanford University",
    skill: "Machine Learning",
    bachelors: "Computer Science - Stanford",
    masters: "AI & Machine Learning - MIT",
    note: "Excellent research background in neural networks",
    point1: 95,
    point2: 88,
    point3: 92,
    summaryPoints: 92
  },
  {
    id: "002",
    name: "Isabella Rodriguez",
    age: 26,
    school: "Harvard University",
    skill: "Full Stack Development",
    bachelors: "Software Engineering - Harvard",
    masters: "Computer Science - Carnegie Mellon",
    note: "Strong leadership and project management skills",
    point1: 90,
    point2: 94,
    point3: 87,
    summaryPoints: 90
  },
  {
    id: "003",
    name: "James Williams",
    age: 30,
    school: "Oxford University",
    skill: "Data Science",
    bachelors: "Mathematics - Oxford",
    masters: "Data Science - Imperial College",
    note: "Published researcher with 15+ papers",
    point1: 93,
    point2: 89,
    point3: 96,
    summaryPoints: 93
  },
  {
    id: "004",
    name: "Sophia Kim",
    age: 25,
    school: "California Institute of Technology",
    skill: "Cybersecurity",
    bachelors: "Computer Engineering - Caltech",
    masters: "Information Security - Georgia Tech",
    note: "Specialized in blockchain and cryptography",
    point1: 88,
    point2: 92,
    point3: 90,
    summaryPoints: 90
  },
  {
    id: "005",
    name: "Michael Johnson",
    age: 29,
    school: "Princeton University",
    skill: "Cloud Architecture",
    bachelors: "Computer Science - Princeton",
    masters: "Cloud Computing - University of Washington",
    note: "AWS and Azure certified architect",
    point1: 91,
    point2: 85,
    point3: 94,
    summaryPoints: 90
  },
  // Adding more mock data for pagination demonstration
  {
    id: "006",
    name: "Emma Thompson",
    age: 27,
    school: "MIT",
    skill: "Robotics",
    bachelors: "Mechanical Engineering - MIT",
    masters: "Robotics Engineering - Carnegie Mellon",
    note: "Expert in autonomous systems and AI integration",
    point1: 94,
    point2: 91,
    point3: 89,
    summaryPoints: 91
  },
  {
    id: "007",
    name: "David Park",
    age: 31,
    school: "UC Berkeley",
    skill: "DevOps",
    bachelors: "Computer Science - UC Berkeley",
    masters: "Systems Engineering - Stanford",
    note: "Kubernetes and Docker specialist with 8+ years experience",
    point1: 87,
    point2: 93,
    point3: 88,
    summaryPoints: 89
  },
  {
    id: "008",
    name: "Sarah Martinez",
    age: 24,
    school: "Cornell University",
    skill: "Mobile Development",
    bachelors: "Computer Science - Cornell",
    masters: "Human-Computer Interaction - Georgia Tech",
    note: "iOS and Android development with UX focus",
    point1: 89,
    point2: 87,
    point3: 95,
    summaryPoints: 90
  },
  {
    id: "009",
    name: "Robert Lee",
    age: 33,
    school: "University of Washington",
    skill: "Blockchain",
    bachelors: "Computer Science - UW",
    masters: "Distributed Systems - MIT",
    note: "Smart contract development and DeFi protocols",
    point1: 92,
    point2: 90,
    point3: 93,
    summaryPoints: 92
  },
  {
    id: "010",
    name: "Maria Garcia",
    age: 26,
    school: "NYU",
    skill: "UI/UX Design",
    bachelors: "Design - NYU",
    masters: "Interactive Media - NYU",
    note: "Award-winning designer with 50+ published designs",
    point1: 96,
    point2: 88,
    point3: 91,
    summaryPoints: 92
  },
  // ... additional entries for demonstration
  {
    id: "011",
    name: "Kevin Zhang",
    age: 29,
    school: "Carnegie Mellon",
    skill: "Game Development",
    bachelors: "Computer Science - CMU",
    masters: "Entertainment Technology - CMU",
    note: "Unity and Unreal Engine expert with 6+ years experience",
    point1: 90,
    point2: 92,
    point3: 87,
    summaryPoints: 90
  },
  {
    id: "012",
    name: "Lisa Wang",
    age: 25,
    school: "Columbia University",
    skill: "Database Administration",
    bachelors: "Information Systems - Columbia",
    masters: "Data Management - NYU",
    note: "PostgreSQL and MongoDB specialist",
    point1: 88,
    point2: 94,
    point3: 89,
    summaryPoints: 90
  }
];

type SortField = keyof Person;
type SortDirection = 'asc' | 'desc' | null;

export function DataTable() {
  const [data, setData] = useState<Person[]>(mockData);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [skillFilter, setSkillFilter] = useState<string>('all');
  const [ageFilter, setAgeFilter] = useState<string>('all');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  // Column widths state for resizable columns
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({
    checkbox: 50,
    id: 80,
    name: 180,
    age: 80,
    school: 220,
    skill: 150,
    bachelors: 250,
    masters: 250,
    note: 300,
    point1: 100,
    point2: 100,
    point3: 100,
    summaryPoints: 140,
    actions: 120
  });

  // Get unique skills for filter
  const uniqueSkills = useMemo(() => {
    return Array.from(new Set(mockData.map(person => person.skill)));
  }, []);

  // Handle sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortDirection(null);
        setSortField(null);
      } else {
        setSortDirection('asc');
      }
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Handle column resize
  const handleColumnResize = (columnKey: string, newWidth: number) => {
    setColumnWidths(prev => ({
      ...prev,
      [columnKey]: Math.max(50, newWidth) // Minimum width of 50px
    }));
  };

  // Sort and filter data
  const processedData = useMemo(() => {
    let filtered = mockData;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(person =>
        Object.values(person).some(value =>
          value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Apply skill filter
    if (skillFilter !== 'all') {
      filtered = filtered.filter(person => person.skill === skillFilter);
    }

    // Apply age filter
    if (ageFilter !== 'all') {
      const [min, max] = ageFilter.split('-').map(Number);
      filtered = filtered.filter(person => {
        if (max) {
          return person.age >= min && person.age <= max;
        }
        return person.age >= min;
      });
    }

    // Apply sorting
    if (sortField && sortDirection) {
      filtered.sort((a, b) => {
        const aValue = a[sortField];
        const bValue = b[sortField];

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          const comparison = aValue.localeCompare(bValue);
          return sortDirection === 'asc' ? comparison : -comparison;
        }

        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
        }

        return 0;
      });
    }

    return filtered;
  }, [searchTerm, skillFilter, ageFilter, sortField, sortDirection]);

  // Pagination calculations
  const totalPages = Math.ceil(processedData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentPageData = processedData.slice(startIndex, endIndex);

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, skillFilter, ageFilter, rowsPerPage]);

  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const handleRowsPerPageChange = (value: string) => {
    setRowsPerPage(parseInt(value));
    setCurrentPage(1);
  };

  // Handle checkbox selection for current page
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(new Set(currentPageData.map(person => person.id)));
    } else {
      setSelectedItems(new Set());
    }
  };

  const handleSelectItem = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedItems);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedItems(newSelected);
  };

  // Sort icon component
  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ArrowUpDown className="ml-2 h-4 w-4 text-muted-foreground" />;
    }
    if (sortDirection === 'asc') {
      return <ArrowUp className="ml-2 h-4 w-4 text-primary" />;
    }
    if (sortDirection === 'desc') {
      return <ArrowDown className="ml-2 h-4 w-4 text-primary" />;
    }
    return <ArrowUpDown className="ml-2 h-4 w-4 text-muted-foreground" />;
  };

  const getPointsBadgeVariant = (points: number) => {
    if (points >= 90) return "default";
    if (points >= 80) return "secondary";
    return "outline";
  };

  // Generate exactly 5 page numbers for pagination (fixed pagination)
  const getFixedPages = () => {
    return [1, 2, 3, 4, 5].filter(page => page <= totalPages);
  };

  // Resizable column header component
  const ResizableHeader = ({
    children,
    columnKey,
    sortField,
    onSort
  }: {
    children: React.ReactNode;
    columnKey: string;
    sortField?: SortField;
    onSort?: () => void;
  }) => {
    const [isResizing, setIsResizing] = useState(false);
    const [startX, setStartX] = useState(0);
    const [startWidth, setStartWidth] = useState(0);

    const handleMouseDown = (e: React.MouseEvent) => {
      e.preventDefault();
      setIsResizing(true);
      setStartX(e.clientX);
      setStartWidth(columnWidths[columnKey]);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const diff = e.clientX - startX;
      const newWidth = startWidth + diff;
      handleColumnResize(columnKey, newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    React.useEffect(() => {
      if (isResizing) {
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        return () => {
          document.removeEventListener('mousemove', handleMouseMove);
          document.removeEventListener('mouseup', handleMouseUp);
        };
      }
    }, [isResizing, startX, startWidth]);

    return (
      <TableHead
        className="relative select-none"
        style={{ width: columnWidths[columnKey], minWidth: columnWidths[columnKey] }}
      >
        <div className="flex items-center justify-between">
          {onSort ? (
            <Button
              variant="ghost"
              className="h-auto p-0 font-medium hover:bg-transparent flex-1 justify-start"
              onClick={onSort}
            >
              {children}
              {sortField && <SortIcon field={sortField} />}
            </Button>
          ) : (
            <div className="font-medium">{children}</div>
          )}
          <div
            className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-primary/20 transition-colors"
            onMouseDown={handleMouseDown}
          >
            <GripVertical className="h-4 w-4 opacity-0 hover:opacity-100 transition-opacity absolute right-0 top-1/2 transform -translate-y-1/2 -translate-x-1/2" />
          </div>
        </div>
      </TableHead>
    );
  };

  return (
    <div className="space-y-6 w-[95%] mx-auto">
      {/* Header with Controls */}
      <Card className="border-border/50 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Search & Filter Controls
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search across all fields..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-background border-border/50 focus:border-primary/50"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-3">
              <Select value={skillFilter} onValueChange={setSkillFilter}>
                <SelectTrigger className="w-[180px] bg-background border-border/50">
                  <SelectValue placeholder="Filter by skill" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Skills</SelectItem>
                  {uniqueSkills.map(skill => (
                    <SelectItem key={skill} value={skill}>{skill}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={ageFilter} onValueChange={setAgeFilter}>
                <SelectTrigger className="w-[150px] bg-background border-border/50">
                  <SelectValue placeholder="Filter by age" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ages</SelectItem>
                  <SelectItem value="20-25">20-25</SelectItem>
                  <SelectItem value="26-30">26-30</SelectItem>
                  <SelectItem value="31-35">31-35</SelectItem>
                  <SelectItem value="36">36+</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card className="border-border/50 shadow-xl">
        <CardContent className="p-0">
          <div className="rounded-lg overflow-hidden border border-border/50">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow className="border-border/50 hover:bg-muted/80">
                    <ResizableHeader columnKey="checkbox">
                      <Checkbox
                        checked={selectedItems.size === currentPageData.length && currentPageData.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </ResizableHeader>
                    <ResizableHeader columnKey="id" sortField="id" onSort={() => handleSort('id')}>
                      ID
                    </ResizableHeader>
                    <ResizableHeader columnKey="name" sortField="name" onSort={() => handleSort('name')}>
                      Name
                    </ResizableHeader>
                    <ResizableHeader columnKey="age" sortField="age" onSort={() => handleSort('age')}>
                      Age
                    </ResizableHeader>
                    <ResizableHeader columnKey="school" sortField="school" onSort={() => handleSort('school')}>
                      School
                    </ResizableHeader>
                    <ResizableHeader columnKey="skill" sortField="skill" onSort={() => handleSort('skill')}>
                      Skill
                    </ResizableHeader>
                    <ResizableHeader columnKey="bachelors">
                      Bachelor's Degree
                    </ResizableHeader>
                    <ResizableHeader columnKey="masters">
                      Master's Degree
                    </ResizableHeader>
                    <ResizableHeader columnKey="note">
                      Note
                    </ResizableHeader>
                    <ResizableHeader columnKey="point1">
                      Point 1
                    </ResizableHeader>
                    <ResizableHeader columnKey="point2">
                      Point 2
                    </ResizableHeader>
                    <ResizableHeader columnKey="point3">
                      Point 3
                    </ResizableHeader>
                    <ResizableHeader columnKey="summaryPoints" sortField="summaryPoints" onSort={() => handleSort('summaryPoints')}>
                      Summary Points
                    </ResizableHeader>
                    <ResizableHeader columnKey="actions">
                      Actions
                    </ResizableHeader>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentPageData.map((person) => (
                    <TableRow
                      key={person.id}
                      className="border-border/50 hover:bg-muted/30 transition-colors"
                    >
                      <TableCell style={{ width: columnWidths.checkbox }}>
                        <Checkbox
                          checked={selectedItems.has(person.id)}
                          onCheckedChange={(checked) => handleSelectItem(person.id, checked as boolean)}
                        />
                      </TableCell>
                      <TableCell className="font-mono" style={{ width: columnWidths.id }}>{person.id}</TableCell>
                      <TableCell className="font-medium" style={{ width: columnWidths.name }}>{person.name}</TableCell>
                      <TableCell style={{ width: columnWidths.age }}>{person.age}</TableCell>
                      <TableCell style={{ width: columnWidths.school }}>
                        <div className="truncate" title={person.school}>
                          {person.school}
                        </div>
                      </TableCell>
                      <TableCell style={{ width: columnWidths.skill }}>
                        <Badge variant="secondary" className="font-medium">
                          {person.skill}
                        </Badge>
                      </TableCell>
                      <TableCell style={{ width: columnWidths.bachelors }}>
                        <div className="truncate" title={person.bachelors}>
                          {person.bachelors}
                        </div>
                      </TableCell>
                      <TableCell style={{ width: columnWidths.masters }}>
                        <div className="truncate" title={person.masters}>
                          {person.masters}
                        </div>
                      </TableCell>
                      <TableCell style={{ width: columnWidths.note }}>
                        <div className="truncate" title={person.note}>
                          {person.note}
                        </div>
                      </TableCell>
                      <TableCell style={{ width: columnWidths.point1 }}>
                        <Badge variant={getPointsBadgeVariant(person.point1)}>
                          {person.point1}
                        </Badge>
                      </TableCell>
                      <TableCell style={{ width: columnWidths.point2 }}>
                        <Badge variant={getPointsBadgeVariant(person.point2)}>
                          {person.point2}
                        </Badge>
                      </TableCell>
                      <TableCell style={{ width: columnWidths.point3 }}>
                        <Badge variant={getPointsBadgeVariant(person.point3)}>
                          {person.point3}
                        </Badge>
                      </TableCell>
                      <TableCell style={{ width: columnWidths.summaryPoints }}>
                        <Badge variant={getPointsBadgeVariant(person.summaryPoints)} className="font-medium">
                          {person.summaryPoints}
                        </Badge>
                      </TableCell>
                      <TableCell style={{ width: columnWidths.actions }}>
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0 border-border/50 hover:bg-primary hover:text-primary-foreground"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0 border-border/50 hover:bg-primary hover:text-primary-foreground"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pagination Controls */}
      <Card className="border-border/50 shadow-lg">
        <CardContent className="py-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {/* Results Summary */}
            <div className="text-sm text-muted-foreground">
              Showing {startIndex + 1} to {Math.min(endIndex, processedData.length)} of {processedData.length} results
              {selectedItems.size > 0 && ` • ${selectedItems.size} selected`}
            </div>

            {/* Fixed Pagination Navigation - Previous, 1, 2, 3, 4, 5, Next */}
            <div className="flex items-center gap-2">
              {/* Previous Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="h-8 px-3"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>

              {/* Fixed Page Numbers: 1, 2, 3, 4, 5 */}
              <div className="flex items-center gap-1">
                {getFixedPages().map((page) => (
                  <Button
                    key={page}
                    variant={page === currentPage ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(page)}
                    className="h-8 w-8 p-0"
                  >
                    {page}
                  </Button>
                ))}
              </div>

              {/* Next Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="h-8 px-3"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Rows Per Page Selector */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground whitespace-nowrap">Rows per page:</span>
              <Select value={rowsPerPage.toString()} onValueChange={handleRowsPerPageChange}>
                <SelectTrigger className="w-[80px] h-8 bg-background border-border/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}