import { Search, UsersIcon } from 'lucide-react';
import {
    Avatar,
    Chip,
    InputAdornment,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
} from '@mui/material';

const TeamMembersSection = ({
    members = [],
    filteredMembers = [],
    searchTerm = "",
    onSearchTermChange = () => { },
}) => {
    return (
        <section className="space-y-4">
            <div className="relative max-w-md">
                <TextField
                    placeholder="Search team members..."
                    value={searchTerm}
                    onChange={(e) => onSearchTermChange(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Search className="size-3" />
                            </InputAdornment>
                        ),
                    }}
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
                        <TableContainer component={Paper} elevation={0}>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Name</TableCell>
                                        <TableCell>Email</TableCell>
                                        <TableCell>Role</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                {filteredMembers.map((member) => (
                                    <TableRow key={member.id} hover>
                                        <TableCell>
                                            <div className="whitespace-nowrap flex items-center gap-3">
                                                <Avatar
                                                src={member.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.id}`}
                                                alt={member.name}
                                                sx={{ width: 28, height: 28 }}
                                            />
                                                <span className="text-sm text-zinc-800 dark:text-white truncate">
                                                    {member.name || "Unknown User"}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap text-sm text-gray-500 dark:text-zinc-400">
                                            {member.email}
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap">
                                            <Chip
                                                size="small"
                                                color={member.role === "ADMIN" ? "secondary" : "default"}
                                                label={member.role || "Member"}
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
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
                                <Chip
                                    size="small"
                                    color={member.role === "ADMIN" ? "secondary" : "default"}
                                    label={member.role || "Member"}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </section>
    );
};

export default TeamMembersSection;
