import { Search, UsersIcon } from 'lucide-react';

const TeamMembersSection = ({
    members = [],
    filteredMembers = [],
    searchTerm = "",
    onSearchTermChange = () => { },
}) => {
    return (
        <section className="space-y-4">
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-zinc-400 size-3" />
                <input
                    placeholder="Search team members..."
                    value={searchTerm}
                    onChange={(e) => onSearchTermChange(e.target.value)}
                    className="pl-8 w-full text-sm rounded-md border border-gray-300 dark:border-zinc-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-400 py-2 focus:outline-none focus:border-blue-500"
                />
            </div>

            {filteredMembers.length === 0 ? (
                <div className="col-span-full text-center py-16">
                    <div className="w-24 h-24 mx-auto mb-6 bg-gray-200 dark:bg-zinc-800 rounded-full flex items-center justify-center">
                        <UsersIcon className="w-12 h-12 text-gray-400 dark:text-zinc-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        {members.length === 0 ? "No team members yet" : "No members match your search"}
                    </h3>
                    <p className="text-gray-500 dark:text-zinc-400 mb-6">
                        {members.length === 0
                            ? "Invite team members to start collaborating"
                            : "Try adjusting your search term"}
                    </p>
                </div>
            ) : (
                <div className="max-w-4xl w-full">
                    <div className="hidden sm:block overflow-x-auto rounded-md border border-gray-200 dark:border-zinc-800">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-zinc-800">
                            <thead className="bg-gray-50 dark:bg-zinc-900/50">
                                <tr>
                                    <th className="px-6 py-2.5 text-left font-medium text-sm">Name</th>
                                    <th className="px-6 py-2.5 text-left font-medium text-sm">Email</th>
                                    <th className="px-6 py-2.5 text-left font-medium text-sm">Role</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
                                {filteredMembers.map((member) => (
                                    <tr
                                        key={member.id}
                                        className="hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors"
                                    >
                                        <td className="px-6 py-2.5 whitespace-nowrap flex items-center gap-3">
                                            <img
                                                src={member.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.id}`}
                                                alt={member.name}
                                                className="size-7 rounded-full bg-gray-200 dark:bg-zinc-800"
                                            />
                                            <span className="text-sm text-zinc-800 dark:text-white truncate">
                                                {member.name || "Unknown User"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-2.5 whitespace-nowrap text-sm text-gray-500 dark:text-zinc-400">
                                            {member.email}
                                        </td>
                                        <td className="px-6 py-2.5 whitespace-nowrap">
                                            <span
                                                className={`px-2 py-1 text-xs rounded-md ${member.role === "ADMIN"
                                                    ? "bg-purple-100 dark:bg-purple-500/20 text-purple-500 dark:text-purple-400"
                                                    : "bg-gray-200 dark:bg-zinc-700 text-gray-700 dark:text-zinc-300"
                                                    }`}
                                            >
                                                {member.role || "Member"}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="sm:hidden space-y-3">
                        {filteredMembers.map((member) => (
                            <div
                                key={member.id}
                                className="p-4 border border-gray-200 dark:border-zinc-800 rounded-md bg-white dark:bg-zinc-900"
                            >
                                <div className="flex items-center gap-3 mb-2">
                                    <img
                                        src={member.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.id}`}
                                        alt={member.name}
                                        className="size-9 rounded-full bg-gray-200 dark:bg-zinc-800"
                                    />
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            {member.name || "Unknown User"}
                                        </p>
                                        <p className="text-sm text-gray-500 dark:text-zinc-400">
                                            {member.email}
                                        </p>
                                    </div>
                                </div>
                                <span
                                    className={`px-2 py-1 text-xs rounded-md ${member.role === "ADMIN"
                                        ? "bg-purple-100 dark:bg-purple-500/20 text-purple-500 dark:text-purple-400"
                                        : "bg-gray-200 dark:bg-zinc-700 text-gray-700 dark:text-zinc-300"
                                        }`}
                                >
                                    {member.role || "Member"}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </section>
    );
};

export default TeamMembersSection;
