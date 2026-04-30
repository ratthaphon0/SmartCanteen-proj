import React from 'react';

const QueueDensityBadge = ({ density }) => {
    const styles = {
        High: "bg-red-500/20 text-red-400 border-red-500/50",
        Medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
        Low: "bg-green-500/20 text-green-400 border-green-500/50"
    };

    const labels = {
        High: "หนาแน่นมาก",
        Medium: "ปานกลาง",
        Low: "ว่างมาก"
    };

    return (
        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${styles[density] || styles.Low}`}>
            {labels[density] || labels.Low}
        </span>
    );
};

export default QueueDensityBadge;
