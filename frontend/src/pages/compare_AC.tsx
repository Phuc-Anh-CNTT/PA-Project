import React, {useState, useCallback} from 'react';
import {CVUploadArea, CVFile} from '../components/CVUploadArea';
import {JDUploadArea, JDFile} from '../components/JDUploadArea';
import {Dashboard, RoleData} from '../components/Dashboard';
import '../styles/Compare_AC.module.css';

export default function Compare_AC() {
    const [cvFiles, setCVFiles] = useState<CVFile[]>([]);
    const [jdFile, setJDFile] = useState<JDFile | null>(null);
    const [roles, setRoles] = useState<RoleData[]>([
        {id: '1', role: 'Frontend Developer', point: 10, percentage: 85},
        {id: '2', role: 'Backend Developer', point: 6, percentage: 72},
        {id: '3', role: 'Full Stack Developer', point: 7, percentage: 78}
    ]);

    // upload CV
    const handleCVFilesUploaded = useCallback((files: File[]) => {
        const newFiles: CVFile[] = files.map(file => ({
            id: Math.random().toString(36).substr(2, 9),
            name: file.name,
            size: file.size,
            type: file.type,
            url: URL.createObjectURL(file),
            uploadedAt: new Date()
        }));
        setCVFiles(prev => [...prev, ...newFiles]);
    }, []);

    // upload JD
    const handleJDFileUploaded = useCallback((file: File) => {
        if (jdFile) URL.revokeObjectURL(jdFile.url);
        const newFile: JDFile = {
            id: Math.random().toString(36).substr(2, 9),
            name: file.name,
            size: file.size,
            type: file.type,
            url: URL.createObjectURL(file),
            uploadedAt: new Date()
        };
        setJDFile(newFile);
    }, [jdFile]);

    // delete CV
    const handleDeleteCV = useCallback((id: string) => {
        setCVFiles(prev => {
            const fileToDelete = prev.find(f => f.id === id);
            if (fileToDelete) URL.revokeObjectURL(fileToDelete.url);
            return prev.filter(f => f.id !== id);
        });
    }, []);

    // delete JD
    const handleDeleteJD = useCallback(() => {
        if (jdFile) {
            URL.revokeObjectURL(jdFile.url);
            setJDFile(null);
        }
    }, [jdFile]);

    // role CRUD
    const handleAddRole = useCallback((role: string, percentage: number, point: number) => {
        const newRole: RoleData = {
            id: Math.random().toString(36).substr(2, 9),
            role,
            percentage,
            point
        };
        setRoles(prev => [...prev, newRole]);
    }, []);

    const handleUpdateRole = useCallback((id: string, role: string, percentage: number) => {
        setRoles(prev => prev.map(r => (r.id === id ? {...r, role, percentage} : r)));
    }, []);

    const handleDeleteRole = useCallback((id: string) => {
        setRoles(prev => prev.filter(r => r.id !== id));
    }, []);

    // 🔥 Button action: gửi hết dữ liệu đi
    const handleSubmit = async () => {
        const payload = {
            cvs: cvFiles.map(f => ({name: f.name, size: f.size, type: f.type})),
            jd: jdFile ? {name: jdFile.name, size: jdFile.size, type: jdFile.type} : null,
            roles
        };

        try {
            const res = await fetch("http://localhost:8000/analyze", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            console.log("✅ Response từ server:", data);
            alert("Request thành công!");
        } catch (err) {
            console.error("❌ Lỗi khi gửi request:", err);
            alert("Request thất bại!");
        }
    };

    return (
        <div className="min-h-screen bg-background p-6 {styles.container}>">
            <div className="max-w-7xl mx-auto space-y-8">
                <div>
                    <h1>CV & Job Description Matching System</h1>
                    <p className="text-muted-foreground">
                        Upload CVs and job descriptions to analyze role matching
                    </p>
                </div>

                <div className="flex gap-6 " style={{ height: "calc(100vh - 150px)" }}>
                    {/* Left side - CV Upload Area (70%) */}
                    <div className="w-[70%]">
                        <CVUploadArea
                            cvFiles={cvFiles}
                            onCVFilesUploaded={handleCVFilesUploaded}
                            onDeleteCV={handleDeleteCV}
                        />
                    </div>

                    {/* Right side - JD and Dashboard (30%) */}
                    <div className="w-[30%] flex flex-col justify-between gap-6">
                        {/* JD + Dashboard nằm chung 1 khối */}
                        <div className="flex flex-col gap-6 h-full">
                            <div className="h-[30%]">
                                <JDUploadArea
                                    jdFile={jdFile}
                                    onJDFileUploaded={handleJDFileUploaded}
                                    onDeleteJD={handleDeleteJD}
                                />
                            </div>
                            <div style={{height:10}}></div>
                            <div className="h-[65%] overflow-auto">
                                <Dashboard
                                    roles={roles}
                                    onAddRole={handleAddRole}
                                    onUpdateRole={handleUpdateRole}
                                    onDeleteRole={handleDeleteRole}
                                />
                            </div>
                        </div>

                        {/* Nút cố định ở dưới cùng */}
                        <div>
                            <button
                                onClick={handleSubmit}
                                className="Upit w-full py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600">
                                Gửi dữ liệu
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
