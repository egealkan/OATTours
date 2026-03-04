import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import toast from 'react-hot-toast';
import ConfirmModal from '../../components/extras/ConfirmModal';
import './AdminCalendar.css';

const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const AdminCalendar = () => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    const [tours, setTours] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [viewYear, setViewYear] = useState(today.getFullYear());
    const [viewMonth, setViewMonth] = useState(today.getMonth());

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTour, setEditingTour] = useState(null);

    const [confirmConfig, setConfirmConfig] = useState({
        isOpen: false, title: '', message: '', onConfirm: () => {}
    });

    useEffect(() => { fetchTours(); }, []);

    const fetchTours = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('tour_schedule')
                .select('*')
                .order('start_date', { ascending: true });
            if (error) throw error;
            setTours(data || []);
        } catch {
            toast.error('Failed to load calendar.');
        } finally {
            setIsLoading(false);
        }
    };

    const getTourStatus = (tour) => {
        if (tour.end_date < todayStr) return 'past';
        if (tour.start_date <= todayStr && tour.end_date >= todayStr) return 'active';
        return 'upcoming';
    };

    const getStatusLabel = (status) => {
        if (status === 'active') return '⭐ Active';
        if (status === 'past') return 'Completed';
        return 'Upcoming';
    };

    const getToursForDay = (dateStr) => {
        return tours.filter(t => dateStr >= t.start_date && dateStr <= t.end_date);
    };

    const getDayStr = (year, month, day) =>
        `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    const getCalendarDays = () => {
        const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
        const firstDay = new Date(viewYear, viewMonth, 1).getDay();
        const cells = Array(firstDay).fill(null);
        for (let d = 1; d <= daysInMonth; d++) cells.push(d);
        return cells;
    };

    const openAddModal = (dateStr = '') => {
        setEditingTour({ id: 'new', tour_name: '', start_date: dateStr, end_date: dateStr, notes: '' });
        setIsModalOpen(true);
    };

    const openEditModal = (tour) => {
        setEditingTour({ ...tour });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingTour(null);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!editingTour.tour_name.trim() || !editingTour.start_date || !editingTour.end_date) {
            toast.error('Please fill in tour name and both dates.');
            return;
        }
        if (editingTour.end_date < editingTour.start_date) {
            toast.error('End date must be on or after the start date.');
            return;
        }
        setIsSaving(true);
        const toastId = toast.loading('Saving...');
        try {
            const payload = {
                tour_name: editingTour.tour_name.trim(),
                start_date: editingTour.start_date,
                end_date: editingTour.end_date,
                notes: editingTour.notes?.trim() || null,
            };
            if (editingTour.id === 'new') {
                const { error } = await supabase.from('tour_schedule').insert([payload]);
                if (error) throw error;
                toast.success('Tour added to calendar!', { id: toastId });
            } else {
                const { error } = await supabase.from('tour_schedule').update(payload).eq('id', editingTour.id);
                if (error) throw error;
                toast.success('Tour updated!', { id: toastId });
            }
            closeModal();
            fetchTours();
        } catch {
            toast.error('Failed to save tour.', { id: toastId });
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = () => {
        setConfirmConfig({
            isOpen: true,
            title: 'Delete Tour?',
            message: `Are you sure you want to remove "${editingTour.tour_name}" from the calendar? This cannot be undone.`,
            onConfirm: async () => {
                const toastId = toast.loading('Deleting...');
                try {
                    const { error } = await supabase.from('tour_schedule').delete().eq('id', editingTour.id);
                    if (error) throw error;
                    toast.success('Tour removed from calendar.', { id: toastId });
                    closeModal();
                    fetchTours();
                } catch {
                    toast.error('Failed to delete tour.', { id: toastId });
                }
            }
        });
    };

    const prevMonth = () => {
        if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
        else setViewMonth(m => m - 1);
    };

    const nextMonth = () => {
        if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
        else setViewMonth(m => m + 1);
    };

    const formatDisplayDate = (dateStr) => {
        if (!dateStr) return '';
        const [y, m, d] = dateStr.split('-');
        const date = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    if (isLoading) {
        return <div style={{ textAlign: 'center', marginTop: '10vh' }}>Loading Calendar...</div>;
    }

    const calendarDays = getCalendarDays();

    // Sort: active first, then upcoming by date asc, then past by date desc
    const sortedTours = [...tours].sort((a, b) => {
        const order = { active: 0, upcoming: 1, past: 2 };
        const sa = getTourStatus(a), sb = getTourStatus(b);
        if (order[sa] !== order[sb]) return order[sa] - order[sb];
        if (sa === 'past') return b.start_date.localeCompare(a.start_date);
        return a.start_date.localeCompare(b.start_date);
    });

    return (
        <div className="calendar-wrapper">

            <ConfirmModal
                isOpen={confirmConfig.isOpen}
                title={confirmConfig.title}
                message={confirmConfig.message}
                onConfirm={confirmConfig.onConfirm}
                onClose={() => setConfirmConfig(c => ({ ...c, isOpen: false }))}
            />

            <div className="calendar-page-header">
                <h1>Tour Calendar</h1>
                <p>Schedule, view, and manage all your tour dates at a glance.</p>
            </div>

            {/* Main Calendar Card */}
            <div className="calendar-card">
                {/* Navigation */}
                <div className="calendar-nav-bar">
                    <button className="nav-btn" onClick={prevMonth} aria-label="Previous month">&#8592;</button>
                    <h2 className="calendar-month-title">{MONTHS[viewMonth]} {viewYear}</h2>
                    <button className="nav-btn" onClick={nextMonth} aria-label="Next month">&#8594;</button>
                    <button
                        className="today-btn"
                        onClick={() => { setViewMonth(today.getMonth()); setViewYear(today.getFullYear()); }}
                    >
                        Today
                    </button>
                </div>

                {/* Day Name Headers */}
                <div className="calendar-day-headers">
                    {DAYS.map(d => <div key={d} className="day-header-cell">{d}</div>)}
                </div>

                {/* Calendar Grid */}
                <div className="calendar-grid-body">
                    {calendarDays.map((day, idx) => {
                        if (day === null) {
                            return <div key={`pad-${idx}`} className="day-cell empty" />;
                        }
                        const dateStr = getDayStr(viewYear, viewMonth, day);
                        const dayTours = getToursForDay(dateStr);
                        const isCurrentDay = dateStr === todayStr;
                        const hasActive = dayTours.some(t => getTourStatus(t) === 'active');

                        return (
                            <div
                                key={dateStr}
                                className={`day-cell ${isCurrentDay ? 'today-cell' : ''} ${dayTours.length > 0 ? `has-tours${hasActive ? ' has-active' : ''}` : ''}`}
                                onClick={() => openAddModal(dateStr)}
                                title="Click to schedule a tour on this date"
                            >
                                <span className="day-number">{day}</span>
                                {dayTours.map(t => (
                                    <div
                                        key={t.id}
                                        className={`tour-pill ${getTourStatus(t)}`}
                                        title={`${t.tour_name} — click to edit`}
                                        onClick={e => { e.stopPropagation(); openEditModal(t); }}
                                    >
                                        {t.tour_name}
                                    </div>
                                ))}
                            </div>
                        );
                    })}
                </div>

                {/* Legend */}
                <div className="calendar-legend">
                    <div className="legend-item">
                        <div className="legend-dot upcoming"></div>
                        <span>Upcoming</span>
                    </div>
                    <div className="legend-item">
                        <div className="legend-dot active"></div>
                        <span>Active / In Progress</span>
                    </div>
                    <div className="legend-item">
                        <div className="legend-dot past"></div>
                        <span>Completed</span>
                    </div>
                    <span className="legend-hint">Click any date to add a new tour</span>
                </div>
            </div>

            {/* Add New Tour Button */}
            <button className="add-tour-btn" onClick={() => openAddModal()}>
                + Schedule New Tour
            </button>

            {/* All Tours List */}
            <div className="tours-list-card">
                <div className="tours-list-header">
                    <h2>All Scheduled Tours ({tours.length})</h2>
                </div>
                <div className="tours-list-body">
                    {sortedTours.length > 0 ? (
                        sortedTours.map(tour => {
                            const status = getTourStatus(tour);
                            return (
                                <div
                                    key={tour.id}
                                    className={`tour-list-item ${status}`}
                                    onClick={() => openEditModal(tour)}
                                >
                                    <div className="tour-item-dates">
                                        {formatDisplayDate(tour.start_date)}<br />→ {formatDisplayDate(tour.end_date)}
                                    </div>
                                    <div className="tour-item-main">
                                        <div className="tour-item-name">{tour.tour_name}</div>
                                        {tour.notes && (
                                            <div className="tour-item-notes">{tour.notes}</div>
                                        )}
                                    </div>
                                    <span className={`tour-item-status ${status}`}>
                                        {getStatusLabel(status)}
                                    </span>
                                </div>
                            );
                        })
                    ) : (
                        <div className="calendar-empty">
                            No tours scheduled yet.<br />Click any date on the calendar to get started!
                        </div>
                    )}
                </div>
            </div>

            {/* Add / Edit Modal */}
            {isModalOpen && editingTour && (
                <div className="calendar-modal-overlay" onClick={closeModal}>
                    <div className="calendar-modal-content" onClick={e => e.stopPropagation()}>

                        <div className="calendar-modal-header">
                            <h2>{editingTour.id === 'new' ? '+ Schedule New Tour' : 'Edit Tour'}</h2>
                            <button className="calendar-modal-close" onClick={closeModal}>&times;</button>
                        </div>

                        <form onSubmit={handleSave}>
                            <div className="calendar-modal-body">
                                <div>
                                    <label>Tour Name</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Turkey Classic — June 2025"
                                        value={editingTour.tour_name}
                                        onChange={e => setEditingTour(t => ({ ...t, tour_name: e.target.value }))}
                                        required
                                        autoFocus
                                    />
                                </div>

                                <div className="date-row">
                                    <div>
                                        <label>Start Date</label>
                                        <input
                                            type="date"
                                            value={editingTour.start_date}
                                            onChange={e => setEditingTour(t => ({ ...t, start_date: e.target.value }))}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label>End Date</label>
                                        <input
                                            type="date"
                                            value={editingTour.end_date}
                                            onChange={e => setEditingTour(t => ({ ...t, end_date: e.target.value }))}
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label>Notes (optional)</label>
                                    <textarea
                                        placeholder="Group size, special notes, tour code..."
                                        value={editingTour.notes || ''}
                                        onChange={e => setEditingTour(t => ({ ...t, notes: e.target.value }))}
                                    />
                                </div>
                            </div>

                            <div className="calendar-modal-actions">
                                {editingTour.id !== 'new' && (
                                    <button type="button" className="btn-delete-tour" onClick={handleDelete}>
                                        Delete
                                    </button>
                                )}
                                <button type="submit" className="btn-save-tour" disabled={isSaving}>
                                    {isSaving
                                        ? 'Saving...'
                                        : editingTour.id === 'new' ? 'Add to Calendar' : 'Save Changes'
                                    }
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCalendar;