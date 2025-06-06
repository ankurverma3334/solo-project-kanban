
import React, { useState } from 'react';
import { Plus, Edit2, Check, X } from 'lucide-react';
import ProjectCard from './ProjectCard';
import { Project } from '@/services/projectService';

interface KanbanBoardProps {
  project: Project;
  onUpdateProject: (project: Project) => Promise<void>;
}

const KanbanBoard = ({ project, onUpdateProject }: KanbanBoardProps) => {
  const [editingColumn, setEditingColumn] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [addingCard, setAddingCard] = useState<string | null>(null);
  const [newCardTitle, setNewCardTitle] = useState('');

  const handleColumnTitleEdit = (columnId: string, newTitle: string) => {
    if (newTitle.trim()) {
      const updatedProject = {
        ...project,
        columns: project.columns.map(col =>
          col.id === columnId ? { ...col, title: newTitle.trim() } : col
        )
      };
      onUpdateProject(updatedProject);
    }
    setEditingColumn(null);
    setEditingTitle('');
  };

  const handleAddCard = (columnId: string) => {
    if (newCardTitle.trim()) {
      const newCard = {
        id: Date.now(),
        title: newCardTitle.trim(),
        description: '',
        createdAt: new Date().toISOString()
      };

      const updatedProject = {
        ...project,
        columns: project.columns.map(col =>
          col.id === columnId
            ? { ...col, cards: [...col.cards, newCard] }
            : col
        )
      };
      onUpdateProject(updatedProject);
    }
    setAddingCard(null);
    setNewCardTitle('');
  };

  const handleDeleteCard = (columnId: string, cardId: number) => {
    const updatedProject = {
      ...project,
      columns: project.columns.map(col =>
        col.id === columnId
          ? { ...col, cards: col.cards.filter(card => card.id !== cardId) }
          : col
      )
    };
    onUpdateProject(updatedProject);
  };

  const handleUpdateCard = (columnId: string, updatedCard: any) => {
    const updatedProject = {
      ...project,
      columns: project.columns.map(col =>
        col.id === columnId
          ? { ...col, cards: col.cards.map(card => card.id === updatedCard.id ? updatedCard : card) }
          : col
      )
    };
    onUpdateProject(updatedProject);
  };

  const handleDragStart = (e: React.DragEvent, card: any, sourceColumnId: string) => {
    e.dataTransfer.setData('application/json', JSON.stringify({ card, sourceColumnId }));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetColumnId: string) => {
    e.preventDefault();
    const data = JSON.parse(e.dataTransfer.getData('application/json'));
    const { card, sourceColumnId } = data;

    if (sourceColumnId !== targetColumnId) {
      const updatedProject = {
        ...project,
        columns: project.columns.map(col => {
          if (col.id === sourceColumnId) {
            return { ...col, cards: col.cards.filter((c: any) => c.id !== card.id) };
          }
          if (col.id === targetColumnId) {
            return { ...col, cards: [...col.cards, card] };
          }
          return col;
        })
      };
      onUpdateProject(updatedProject);
    }
  };

  return (
    <div className="h-full">
      <div className="grid grid-cols-3 gap-6 h-full">
        {project.columns.map((column) => (
          <div
            key={column.id}
            className="bg-gray-100 rounded-lg p-4 flex flex-col"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between mb-4">
              {editingColumn === column.id ? (
                <div className="flex items-center space-x-2 flex-1">
                  <input
                    type="text"
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleColumnTitleEdit(column.id, editingTitle);
                      } else if (e.key === 'Escape') {
                        setEditingColumn(null);
                        setEditingTitle('');
                      }
                    }}
                  />
                  <button
                    onClick={() => handleColumnTitleEdit(column.id, editingTitle)}
                    className="p-1 text-green-600 hover:text-green-700"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setEditingColumn(null);
                      setEditingTitle('');
                    }}
                    className="p-1 text-red-600 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold text-gray-800">{column.title}</h3>
                    <span className="bg-gray-300 text-gray-700 text-xs px-2 py-1 rounded-full">
                      {column.cards.length}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setEditingColumn(column.id);
                      setEditingTitle(column.title);
                    }}
                    className="p-1 text-gray-500 hover:text-gray-700"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>

            {/* Cards */}
            <div className="flex-1 space-y-3 mb-4 overflow-y-auto">
              {column.cards.map((card) => (
                <ProjectCard
                  key={card.id}
                  card={card}
                  onDelete={() => handleDeleteCard(column.id, card.id)}
                  onUpdate={(updatedCard) => handleUpdateCard(column.id, updatedCard)}
                  onDragStart={(e) => handleDragStart(e, card, column.id)}
                />
              ))}
            </div>

            {/* Add Card */}
            {addingCard === column.id ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={newCardTitle}
                  onChange={(e) => setNewCardTitle(e.target.value)}
                  placeholder="Enter card title"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleAddCard(column.id);
                    } else if (e.key === 'Escape') {
                      setAddingCard(null);
                      setNewCardTitle('');
                    }
                  }}
                />
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleAddCard(column.id)}
                    className="flex-1 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                  >
                    Add Card
                  </button>
                  <button
                    onClick={() => {
                      setAddingCard(null);
                      setNewCardTitle('');
                    }}
                    className="flex-1 px-3 py-1 bg-gray-400 text-white text-sm rounded hover:bg-gray-500 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setAddingCard(column.id)}
                className="flex items-center justify-center space-x-2 p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add a card</span>
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default KanbanBoard;
