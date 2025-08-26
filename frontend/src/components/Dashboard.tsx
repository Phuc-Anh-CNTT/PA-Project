import React, {useState, useRef, useCallback} from 'react';
import {Plus, Trash2, Edit2} from 'lucide-react';
import {Button} from './ui/button';
import {Card} from './ui/card';
import {Input} from './ui/input';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from './ui/table';
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger} from './ui/dialog';
import {Label} from './ui/label';

export interface RoleData {
    id: string;
    role: string;
    percentage: number;
    point: number;
}

interface DashboardProps {
    roles: RoleData[];
    onAddRole: (role: string, percentage: number, point: number) => void;
    onUpdateRole: (id: string, role: string, percentage: number, point: number) => void;
    onDeleteRole: (id: string) => void;
}

export function Dashboard({roles, onAddRole, onUpdateRole, onDeleteRole}: DashboardProps) {
    const [editingField, setEditingField] = useState<{
        id: string;
        field: 'role' | 'percentage' | 'point'
    } | null>(null);
    const [editValue, setEditValue] = useState('');
    const [dragData, setDragData] = useState<{ id: string; startX: number; startPercentage: number } | null>(null);
    const sliderRef = useRef<HTMLDivElement>(null);

    const handleAddRole = () => {
        onAddRole("New Role", 50, 10);
    };

    const startEdit = useCallback((id: string, field: 'role' | 'percentage' | 'point', currentValue: string | number | number) => {
        setEditingField({id, field});
        setEditValue(currentValue.toString());
    }, []);

    const finishEdit = useCallback(() => {
        if (!editingField) return;

        const {id, field} = editingField;
        const role = roles.find(r => r.id === id);
        if (!role) return;

        if (field === 'role') {
            if (editValue.trim()) {
                onUpdateRole(id, editValue.trim(), role.percentage, role.point);
            }
        } else if (field === 'percentage') {
            const percentage = parseFloat(editValue);
            if (!isNaN(percentage) && percentage >= 0 && percentage <= 100) {
                onUpdateRole(id, role.role, percentage, role.point);
            }
        }

        setEditingField(null);
        setEditValue('');
    }, [editingField, editValue, roles, onUpdateRole]);

    const cancelEdit = useCallback(() => {
        setEditingField(null);
        setEditValue('');
    }, []);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            finishEdit();
        } else if (e.key === 'Escape') {
            cancelEdit();
        }
    }, [finishEdit, cancelEdit]);

    const handleMouseDown = useCallback((e: React.MouseEvent, id: string, percentage: number) => {
        e.preventDefault();
        setDragData({
            id,
            startX: e.clientX,
            startPercentage: percentage
        });
    }, []);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!dragData || !sliderRef.current) return;

        const sliderRect = sliderRef.current.getBoundingClientRect();
        const sliderWidth = sliderRect.width;
        const deltaX = e.clientX - dragData.startX;
        // Ví dụ x2 tốc độ
        const speedFactor = 4;
        const percentageChange = (deltaX / sliderWidth) * 100 * speedFactor;

        let newPercentage = dragData.startPercentage + percentageChange;
        newPercentage = Math.max(0, Math.min(100, newPercentage));

        const role = roles.find(r => r.id === dragData.id);
        if (role) {
            onUpdateRole(dragData.id, role.role, Math.round(newPercentage), role.point);
        }
    }, [dragData, roles, onUpdateRole]);

    const handleMouseUp = useCallback(() => {
        setDragData(null);
    }, []);

    React.useEffect(() => {
        if (dragData) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [dragData, handleMouseMove, handleMouseUp]);

    return (
        <Card className="p-4 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4 flex-shrink-0" style={{gap: 0}}>
                <div className="flex-1 min-w-0 mr-3">
                    <h2 className="text-lg">Role Matching Dashboard</h2>
                    <p className="text-xs text-muted-foreground">
                        Click to edit roles and percentages
                    </p>
                </div>

                <Button size="sm" onClick={handleAddRole} className="flex-shrink-0">
                    <Plus className="w-3 h-3 mr-1"/>
                    Add Role
                </Button>
            </div>

            <div className="flex-1 border rounded-lg overflow-hidden flex flex-col min-h-0">
                <div className="flex-shrink-0 border-b">
                    <div className="grid grid-cols-12 gap-2 p-3 bg-muted/50">
                        <div className="col-span-4 text-xs font-medium">Role</div>
                        <div className="col-span-4 text-xs font-medium">Match</div>
                        <div className="col-span-2 text-xs font-medium">Point</div>
                        <div className="col-span-2 text-xs font-medium text-center">Actions</div>
                    </div>
                </div>

                <div className="flex-1 overflow-auto " style={{maxHeight: "240px"}} ref={sliderRef}>
                    {roles.length === 0 ? (
                        <div
                            className="flex items-center justify-center h-full p-6 text-center text-muted-foreground text-sm">
                            No roles added yet. Click "Add Role" to get started.
                        </div>
                    ) : (
                        <div className="divide-y">
                            {roles.map((role) => (
                                <div key={role.id}
                                     className="grid grid-cols-12 gap-2 p-3 hover:bg-accent/50 transition-colors">
                                    <div className="col-span-4 flex items-center min-w-0">
                                        {editingField?.id === role.id && editingField.field === 'role' ? (
                                            <Input
                                                value={editValue}
                                                onChange={(e) => setEditValue(e.target.value)}
                                                onKeyDown={handleKeyDown}
                                                onBlur={finishEdit}
                                                autoFocus
                                                className="text-sm w-full"
                                            />
                                        ) : (
                                            <span
                                                className="text-sm break-words leading-tight cursor-pointer hover:bg-accent/30 px-1 py-0.5 rounded w-full block"
                                                title={role.role}
                                                onClick={() => startEdit(role.id, 'role', role.role)}
                                            >
                                                {role.role}
                                              </span>
                                        )}
                                    </div>

                                    <div className="col-span-4 flex items-center min-w-0">
                                        <div className="flex items-center space-x-2 w-full">
                                            <div
                                                className="flex-1 bg-gray-200 rounded-full h-2 min-w-[30px] relative cursor-pointer">
                                                <div
                                                    className="bg-blue-600 h-2 rounded-full transition-all duration-150 relative"
                                                    style={{width: `${role.percentage}%`}}
                                                    onMouseDown={(e) => handleMouseDown(e, role.id, role.percentage)}
                                                >
                                                    <div
                                                        className="absolute right-0 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-pink-500 rounded-full border-2 border-white shadow-md cursor-grab active:cursor-grabbing"
                                                    />
                                                </div>
                                            </div>
                                            {editingField?.id === role.id && editingField.field === 'percentage' ? (
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    value={editValue}
                                                    onChange={(e) => setEditValue(e.target.value)}
                                                    onKeyDown={handleKeyDown}
                                                    onBlur={finishEdit}
                                                    autoFocus
                                                    className="text-xs w-12 h-6"
                                                />
                                            ) : (
                                                <span
                                                    className="text-xs flex-shrink-0 min-w-[30px] text-right cursor-pointer hover:bg-accent/30 px-1 py-0.5 rounded"
                                                    onClick={() => startEdit(role.id, 'percentage', role.percentage)}
                                                >
                                                  {role.percentage}%
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    {/* Point */}
                                    <div className="col-span-2 flex items-center justify-center">
                                        {editingField?.id === role.id && editingField.field === "point" ? (
                                            <Input
                                                type="number"
                                                min="0"
                                                max="10"
                                                value={editValue}
                                                onChange={(e) => {
                                                    let val = parseInt(e.target.value, 10);
                                                    if (isNaN(val)) val = 0;
                                                    if (val > 10) val = 10;
                                                    setEditValue(val.toString());
                                                }}
                                                onKeyDown={handleKeyDown}
                                                onBlur={finishEdit}
                                                autoFocus
                                                className="text-xs w-14 text-center"
                                            />
                                        ) : (
                                            <span
                                                className="text-xs cursor-pointer text-center block w-full"
                                                onClick={() => startEdit(role.id, "point", role.point)}
                                            >
      {role.point}/10
    </span>
                                        )}
                                    </div>
                                    <div className="col-span-2 flex items-center justify-center">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => onDeleteRole(role.id)}
                                            className="text-destructive hover:text-destructive p-1 h-6 w-6"
                                        >
                                            <Trash2 className="w-3 h-3"/>
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
}